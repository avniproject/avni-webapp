package org.openchs.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.codehaus.jettison.json.JSONException;
import org.openchs.application.Form;
import org.openchs.application.RuleType;
import org.openchs.dao.*;
import org.openchs.dao.application.FormRepository;
import org.openchs.dao.individualRelationship.RuleFailureLogRepository;
import org.openchs.domain.*;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.web.RestClient;
import org.openchs.web.request.RuleRequest;
import org.openchs.web.request.rules.RulesContractWrapper.EncounterContractWrapper;
import org.openchs.web.request.rules.RulesContractWrapper.IndividualContractWrapper;
import org.openchs.web.request.rules.RulesContractWrapper.ProgramEncounterContractWrapper;
import org.openchs.web.request.rules.RulesContractWrapper.ProgramEnrolmentContractWrapper;
import org.openchs.web.request.rules.constant.RuleEnum;
import org.openchs.web.request.rules.constant.WorkFlowTypeEnum;
import org.openchs.web.request.rules.constructWrappers.IndividualConstructionService;
import org.openchs.web.request.rules.constructWrappers.ObservationConstructionService;
import org.openchs.web.request.rules.constructWrappers.ProgramEncounterConstructionService;
import org.openchs.web.request.rules.constructWrappers.ProgramEnrolmentConstructionService;
import org.openchs.web.request.rules.request.IndividualRequestEntity;
import org.openchs.web.request.rules.request.RequestEntityWrapper;
import org.openchs.web.request.rules.request.RuleRequestEntity;
import org.openchs.web.request.rules.response.RuleError;
import org.openchs.web.request.rules.response.RuleResponseEntity;
import org.openchs.web.request.rules.validateRules.RuleValidationService;
import org.openchs.web.validation.ValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.transaction.Transactional;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class RuleService {
    private final Logger logger;
    private final RuleDependencyRepository ruleDependencyRepository;
    private final RuleRepository ruleRepository;
    private final Map<RuledEntityType, CHSRepository> ruledEntityRepositories;
    private final ProgramEnrolmentRepository programEnrolmentRepository;
    private final RestClient restClient;
    private final IndividualConstructionService individualConstructionService;
    private final RuleValidationService ruleValidationService;
    private final ProgramEncounterConstructionService programEncounterConstructionService;
    private final ProgramEnrolmentConstructionService programEnrolmentConstructionService;
    private final ObservationConstructionService observationConstructionService;
    private final FormRepository formRepository;
    private final RuleFailureLogRepository ruleFailureLogRepository;

    @Autowired
    public RuleService(RuleDependencyRepository ruleDependencyRepository,
                       RuleRepository ruleRepository,
                       FormRepository formRepository,
                       ProgramRepository programRepository,
                       EncounterTypeRepository encounterTypeRepository,
                       ProgramEnrolmentRepository programEnrolmentRepository,
                       RestClient restClient,
                       IndividualConstructionService individualConstructionService,
                       RuleValidationService ruleValidationService,
                       ProgramEncounterConstructionService programEncounterConstructionService,
                       ProgramEnrolmentConstructionService programEnrolmentConstructionService,
                       ObservationConstructionService observationConstructionService,
                       RuleFailureLogRepository ruleFailureLogRepository) {
        this.ruleFailureLogRepository = ruleFailureLogRepository;
        logger = LoggerFactory.getLogger(this.getClass());
        this.ruleDependencyRepository = ruleDependencyRepository;
        this.ruleRepository = ruleRepository;
        this.ruledEntityRepositories = new HashMap<RuledEntityType, CHSRepository>() {{
            put(RuledEntityType.Form, formRepository);
            put(RuledEntityType.Program, programRepository);
            put(RuledEntityType.EncounterType, encounterTypeRepository);
        }};
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.restClient = restClient;
        this.individualConstructionService = individualConstructionService;
        this.ruleValidationService = ruleValidationService;
        this.programEncounterConstructionService = programEncounterConstructionService;
        this.programEnrolmentConstructionService = programEnrolmentConstructionService;
        this.observationConstructionService = observationConstructionService;
        this.formRepository = formRepository;
    }

    @Transactional
    public RuleDependency createDependency(String ruleCode, String ruleHash) {
        RuleDependency ruleDependency = ruleDependencyRepository
                .findByOrganisationId(UserContextHolder.getUserContext().getOrganisation().getId());
        if (ruleDependency == null) ruleDependency = new RuleDependency();
        if (ruleHash.equals(ruleDependency.getChecksum())) return ruleDependency;
        ruleDependency.setCode(ruleCode);
        ruleDependency.setChecksum(ruleHash);
        ruleDependency.assignUUIDIfRequired();
        logger.info(String.format("Rule dependency with UUID: %s", ruleDependency.getUuid()));
        return ruleDependencyRepository.save(ruleDependency);
    }

    private Rule _setCommonAttributes(Rule rule, RuleRequest ruleRequest) {
        rule.setUuid(ruleRequest.getUuid());
        rule.setData(new RuleData(ruleRequest.getData()));
        rule.setName(ruleRequest.getName());
        rule.setFnName(ruleRequest.getFnName());
        rule.setType(RuleType.valueOf(StringUtils.capitalize(ruleRequest.getType())));
        rule.setExecutionOrder(ruleRequest.getExecutionOrder());
        rule.setVoided(false);
        return rule;
    }

    @Transactional
    public Rule createOrUpdate(RuleRequest ruleRequest) {
        String ruleDependencyUUID = ruleRequest.getRuleDependencyUUID();
        RuleDependency ruleDependency = ruleDependencyRepository.findByUuid(ruleDependencyUUID);
        String ruleUUID = ruleRequest.getUuid();
        Rule rule = ruleRepository.findByUuid(ruleUUID);
        if (rule == null) rule = new Rule();
        rule.setRuleDependency(ruleDependency);
        rule = this._setCommonAttributes(rule, ruleRequest);
        String entityUUID = ruleRequest.getEntityUUID();

        checkEntityExists(ruleRequest);

        rule.setEntity(ruleRequest.getEntity());

        logger.info(String.format("Creating Rule with UUID '%s', Name '%s', Type '%s', Entity '%s'",
                rule.getUuid(), rule.getName(), rule.getType(), ruleRequest.getEntityType()));

        return ruleRepository.save(rule);
    }

    private void checkEntityExists(RuleRequest ruleRequest) {
        String entityUUID = ruleRequest.getEntityUUID();
        if (!RuledEntityType.isNone(ruleRequest.getEntityType())) {
            CHSRepository chsRepository = ruledEntityRepositories.get(ruleRequest.getEntityType());
            if (chsRepository.findByUuid(entityUUID) == null) {
                throw new ValidationException(String.format("%s with uuid: %s not found for rule with uuid: %s",
                        ruleRequest.getEntityType(), entityUUID, ruleRequest.getUuid()));
            }
        }
    }

    @Transactional
    public void createOrUpdate(List<RuleRequest> rules) {
        List<Rule> rulesFromDB = ruleRepository.findByOrganisationId(UserContextHolder.getUserContext().getOrganisation().getId());
        List<String> newRuleUUIDs = rules.stream()
                .map(this::createOrUpdate)
                .map(Rule::getUuid)
                .collect(Collectors.toList());

        Stream<Rule> deletedRules = rulesFromDB.stream().filter(r -> !newRuleUUIDs.contains(r.getUuid()));

        deletedRules.peek(vr -> vr.setVoided(true)).forEach(ruleRepository::save);
    }

    public RuleResponseEntity visitScheduleRuleProgramEnrolmentWorkFlow(RequestEntityWrapper requestEntityWrapper) {
        RuleRequestEntity rule = getRuleRequestEntityWithVisitScheduleRuleCode(requestEntityWrapper);
        if (StringUtils.isEmpty(rule.getCode())) {
            return emptySuccessEntity();
        }
        String ruleType = rule.getRuleType().toLowerCase();
        ProgramEnrolmentContractWrapper programEnrolmentContractWrapper = programEnrolmentConstructionService.constructProgramEnrolmentContract(requestEntityWrapper.getProgramEnrolmentRequestEntity());
        programEnrolmentContractWrapper.setRule(rule);
        RuleFailureLog ruleFailureLog = ruleValidationService.generateRuleFailureLog(requestEntityWrapper, "Web", "Rules : Program Enrolment", requestEntityWrapper.getProgramEnrolmentRequestEntity().getUuid());
        programEnrolmentContractWrapper.setVisitSchedules(programEncounterConstructionService.constructProgramEnrolmentVisitScheduleContract(requestEntityWrapper.getProgramEnrolmentRequestEntity().getUuid()));
        RuleResponseEntity ruleResponseEntity = createHttpHeaderAndSendRequest("/api/" + ruleType + "_" + RuleEnum.PROGRAM_ENROLMENT_RULE.getRuleName(), programEnrolmentContractWrapper, ruleFailureLog);
        return ruleResponseEntity;
    }

    public RuleResponseEntity visitScheduleRuleProgramEncounterWorkFlow(RequestEntityWrapper requestEntityWrapper) {
        RuleRequestEntity rule = getRuleRequestEntityWithVisitScheduleRuleCode(requestEntityWrapper);
        if (StringUtils.isEmpty(rule.getCode())) {
            return emptySuccessEntity();
        }
        String ruleType = rule.getRuleType().toLowerCase();
        ProgramEncounterContractWrapper programEncounterContractWrapper = programEncounterConstructionService.constructProgramEncounterContract(requestEntityWrapper.getProgramEncounterRequestEntity());
        programEncounterContractWrapper.setVisitSchedules(programEncounterConstructionService.constructProgramEnrolmentVisitScheduleContract(requestEntityWrapper.getProgramEncounterRequestEntity().getProgramEnrolmentUUID()));
        programEncounterContractWrapper.setRule(rule);
        RuleFailureLog ruleFailureLog = ruleValidationService.generateRuleFailureLog(requestEntityWrapper, "Web", "Rules : Program Encounter", requestEntityWrapper.getProgramEncounterRequestEntity().getUuid());
        RuleResponseEntity ruleResponseEntity = createHttpHeaderAndSendRequest("/api/" + ruleType + "_" + RuleEnum.PROGRAM_ENCOUNTER_RULE.getRuleName(), programEncounterContractWrapper, ruleFailureLog);
        return ruleResponseEntity;
    }

    public RuleResponseEntity visitScheduleRuleEncounterWorkFlow(RequestEntityWrapper requestEntityWrapper) {
        RuleRequestEntity rule = getRuleRequestEntityWithVisitScheduleRuleCode(requestEntityWrapper);
        if (StringUtils.isEmpty(rule.getCode())) {
            return emptySuccessEntity();
        }
        String ruleType = rule.getRuleType().toLowerCase();
        EncounterContractWrapper encounterContractWrapper = programEncounterConstructionService.constructEncounterContract(requestEntityWrapper.getEncounterRequestEntity());
        encounterContractWrapper.setRule(rule);
        RuleFailureLog ruleFailureLog = ruleValidationService.generateRuleFailureLog(requestEntityWrapper, "Web", "Rules : Encounter", requestEntityWrapper.getEncounterRequestEntity().getUuid());
        RuleResponseEntity ruleResponseEntity = createHttpHeaderAndSendRequest("/api/" + ruleType + "_" + RuleEnum.ENCOUNTER_RULE.getRuleName(), encounterContractWrapper, ruleFailureLog);
        return ruleResponseEntity;
    }

    public RuleResponseEntity visitScheduleRuleIndividualWorkFlow(RequestEntityWrapper requestEntityWrapper) {
        RuleRequestEntity rule = getRuleRequestEntityWithVisitScheduleRuleCode(requestEntityWrapper);
        String ruleType = rule.getRuleType().toLowerCase();
        IndividualRequestEntity individualRequestEntity = requestEntityWrapper.getIndividualRequestEntity();
        IndividualContractWrapper individualContractWrapper = individualConstructionService.constructIndividualContract(individualRequestEntity);
        individualContractWrapper.setRule(rule);
        RuleFailureLog ruleFailureLog = ruleValidationService.generateRuleFailureLog(
                requestEntityWrapper,
                "Web",
                "Rules : Individual",
                individualRequestEntity.getUuid()
        );
        RuleResponseEntity ruleResponseEntity = createHttpHeaderAndSendRequest("/api/" + ruleType + "_" + RuleEnum.INDIVIDUAL_RULE.getRuleName(), individualContractWrapper, ruleFailureLog);
        return ruleResponseEntity;
    }

    public RuleResponseEntity decisionRuleProgramEnrolmentWorkFlow(RequestEntityWrapper requestEntityWrapper) {
        RuleRequestEntity rule = getRuleRequestEntityWithDecisionRuleCode(requestEntityWrapper);
        if (StringUtils.isEmpty(rule.getCode())) {
            return emptySuccessEntity();
        }
        String ruleType = rule.getRuleType().toLowerCase();
        ProgramEnrolmentContractWrapper programEnrolmentContractWrapper = programEnrolmentConstructionService.constructProgramEnrolmentContract(requestEntityWrapper.getProgramEnrolmentRequestEntity());
        programEnrolmentContractWrapper.setRule(rule);
        RuleFailureLog ruleFailureLog = ruleValidationService.generateRuleFailureLog(requestEntityWrapper, "Web", "Rules : Program Enrolment", requestEntityWrapper.getProgramEnrolmentRequestEntity().getUuid());
        RuleResponseEntity ruleResponseEntity = createHttpHeaderAndSendRequest("/api/" + ruleType + "_" + RuleEnum.PROGRAM_ENROLMENT_RULE.getRuleName(), programEnrolmentContractWrapper, ruleFailureLog);
        if ("success".equals(ruleResponseEntity.getStatus())) {
            ruleResponseEntity.getDecisions().setEnrolmentDecisions(ruleValidationService.validateDecision(ruleResponseEntity.getDecisions().getEnrolmentDecisions(), ruleFailureLog));
            ruleResponseEntity.setObservation(observationConstructionService.responseObservation(ruleResponseEntity.getDecisions().getEnrolmentDecisions()));
        }
        return ruleResponseEntity;
    }

    public RuleResponseEntity decisionRuleEncounterWorkFlow(RequestEntityWrapper requestEntityWrapper) {
        RuleRequestEntity rule = getRuleRequestEntityWithDecisionRuleCode(requestEntityWrapper);
        if (StringUtils.isEmpty(rule.getCode())) {
            return emptySuccessEntity();
        }
        String ruleType = rule.getRuleType().toLowerCase();
        EncounterContractWrapper encounterContractWrapper = programEncounterConstructionService.constructEncounterContract(requestEntityWrapper.getEncounterRequestEntity());
        encounterContractWrapper.setRule(rule);
        RuleFailureLog ruleFailureLog = ruleValidationService.generateRuleFailureLog(requestEntityWrapper, "Web", "Rules : Encounter", requestEntityWrapper.getEncounterRequestEntity().getUuid());
        RuleResponseEntity ruleResponseEntity = createHttpHeaderAndSendRequest("/api/" + ruleType + "_" + RuleEnum.ENCOUNTER_RULE.getRuleName(), encounterContractWrapper, ruleFailureLog);
        if ("success".equals(ruleResponseEntity.getStatus())) {
            ruleResponseEntity.getDecisions().setEncounterDecisions(ruleValidationService.validateDecision(ruleResponseEntity.getDecisions().getEncounterDecisions(), ruleFailureLog));
            ruleResponseEntity.setObservation(observationConstructionService.responseObservation(ruleResponseEntity.getDecisions().getEncounterDecisions()));
        }
        return ruleResponseEntity;
    }

    public RuleResponseEntity decisionRuleProgramEncounterWorkFlow(RequestEntityWrapper requestEntityWrapper) {
        RuleRequestEntity rule = getRuleRequestEntityWithDecisionRuleCode(requestEntityWrapper);
        if (StringUtils.isEmpty(rule.getCode())) {
            return emptySuccessEntity();
        }
        String ruleType = rule.getRuleType().toLowerCase();
        ProgramEncounterContractWrapper programEncounterContractWrapper = programEncounterConstructionService.constructProgramEncounterContract(requestEntityWrapper.getProgramEncounterRequestEntity());
        programEncounterContractWrapper.setRule(rule);
        RuleFailureLog ruleFailureLog = ruleValidationService.generateRuleFailureLog(requestEntityWrapper, "Web", "Rules : Program Encounter", requestEntityWrapper.getProgramEncounterRequestEntity().getUuid());
        RuleResponseEntity ruleResponseEntity = createHttpHeaderAndSendRequest("/api/" + ruleType + "_" + RuleEnum.PROGRAM_ENCOUNTER_RULE.getRuleName(), programEncounterContractWrapper, ruleFailureLog);
        if ("success".equals(ruleResponseEntity.getStatus())) {
            ruleResponseEntity.getDecisions().setEncounterDecisions(ruleValidationService.validateDecision(ruleResponseEntity.getDecisions().getEncounterDecisions(), ruleFailureLog));
            ruleResponseEntity.setObservation(observationConstructionService.responseObservation(ruleResponseEntity.getDecisions().getEncounterDecisions()));
        }
        return ruleResponseEntity;
    }

    public RuleResponseEntity decisionRuleIndividualWorkFlow(RequestEntityWrapper requestEntityWrapper) throws IOException, JSONException {
        RuleRequestEntity rule = getRuleRequestEntityWithDecisionRuleCode(requestEntityWrapper);
        if (StringUtils.isEmpty(rule.getCode())) {
            return emptySuccessEntity();
        }
        String ruleType = rule.getRuleType().toLowerCase();
        IndividualContractWrapper individualContractWrapper = individualConstructionService.constructIndividualContract(requestEntityWrapper.getIndividualRequestEntity());
        individualContractWrapper.setRule(rule);
        RuleFailureLog ruleFailureLog = ruleValidationService.generateRuleFailureLog(requestEntityWrapper, "Web", "Rules : Individual", requestEntityWrapper.getIndividualRequestEntity().getUuid());
        RuleResponseEntity ruleResponseEntity = createHttpHeaderAndSendRequest("/api/" + ruleType + "_" + RuleEnum.INDIVIDUAL_RULE.getRuleName(), individualContractWrapper, ruleFailureLog);
        if ("success".equals(ruleResponseEntity.getStatus())) {
            ruleResponseEntity.getDecisions().setRegistrationDecisions(ruleValidationService.validateDecision(ruleResponseEntity.getDecisions().getRegistrationDecisions(), ruleFailureLog));
            ruleResponseEntity.setObservation(observationConstructionService.responseObservation(ruleResponseEntity.getDecisions().getRegistrationDecisions()));
        }
        return ruleResponseEntity;
    }

    public RuleResponseEntity executeServerSideRules(RequestEntityWrapper requestEntityWrapper) throws IOException, JSONException {
        RuleRequestEntity rule = requestEntityWrapper.getRule();
        Form form = formRepository.findByUuid(rule.getFormUuid());
        rule.setDecisionCode(form.getDecisionRule());
        rule.setVisitScheduleCode(form.getVisitScheduleRule());
        if (StringUtils.isEmpty(rule.getDecisionCode()) && StringUtils.isEmpty(rule.getVisitScheduleCode())) {
            return emptySuccessEntity();
        }

        Object entity = null;
        String entityUuid = null;
        String workFlowType = requestEntityWrapper.getRule().getWorkFlowType();
        switch (WorkFlowTypeEnum.findByValue(workFlowType.toLowerCase())) {
            case PROGRAM_ENROLMENT:
                entityUuid = requestEntityWrapper.getProgramEnrolmentRequestEntity().getUuid();
                ProgramEnrolmentContractWrapper programEnrolmentContractWrapper = programEnrolmentConstructionService.constructProgramEnrolmentContract(requestEntityWrapper.getProgramEnrolmentRequestEntity());
                programEnrolmentContractWrapper.setRule(rule);
                entity = programEnrolmentContractWrapper;
                break;
            case PROGRAM_ENCOUNTER:
                entityUuid = requestEntityWrapper.getProgramEncounterRequestEntity().getUuid();
                ProgramEncounterContractWrapper programEncounterContractWrapper = programEncounterConstructionService.constructProgramEncounterContract(requestEntityWrapper.getProgramEncounterRequestEntity());
                programEncounterContractWrapper.setRule(rule);
                entity = programEncounterContractWrapper;
                break;
            case ENCOUNTER:
                entityUuid = requestEntityWrapper.getEncounterRequestEntity().getUuid();
                EncounterContractWrapper encounterContractWrapper = programEncounterConstructionService.constructEncounterContract(requestEntityWrapper.getEncounterRequestEntity());
                encounterContractWrapper.setRule(rule);
                entity = encounterContractWrapper;
                break;
            case INDIVIDUAL:
                entityUuid = requestEntityWrapper.getIndividualRequestEntity().getUuid();
                IndividualContractWrapper individualContractWrapper = individualConstructionService.constructIndividualContract(requestEntityWrapper.getIndividualRequestEntity());
                individualContractWrapper.setRule(rule);
                entity = individualContractWrapper;
                break;
        }

        RuleFailureLog ruleFailureLog = ruleValidationService.generateRuleFailureLog(requestEntityWrapper, "Web", "Rules : " + workFlowType, entityUuid);
        RuleResponseEntity ruleResponseEntity = createHttpHeaderAndSendRequest("/api/rules", entity, ruleFailureLog);
        return ruleResponseEntity;
    }

    private RuleResponseEntity emptySuccessEntity() {
        RuleResponseEntity entity = new RuleResponseEntity();
        entity.setStatus("success");
        return entity;
    }

    private RuleRequestEntity getRuleRequestEntityWithVisitScheduleRuleCode(RequestEntityWrapper requestEntityWrapper) {
        RuleRequestEntity rule = requestEntityWrapper.getRule();
        Form form = formRepository.findByUuid(rule.getFormUuid());
        rule.setCode(form.getVisitScheduleRule());
        return rule;
    }

    private RuleRequestEntity getRuleRequestEntityWithDecisionRuleCode(RequestEntityWrapper requestEntityWrapper) {
        RuleRequestEntity rule = requestEntityWrapper.getRule();
        Form form = formRepository.findByUuid(rule.getFormUuid());
        rule.setCode(form.getDecisionRule());
        return rule;
    }

    private RuleResponseEntity createHttpHeaderAndSendRequest(String url, Object contractObject, RuleFailureLog ruleFailureLog) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.setContentType(MediaType.APPLICATION_JSON);
            String ruleResponse = restClient.post(url, contractObject, httpHeaders);
            RuleResponseEntity ruleResponseEntity = mapper.readValue(ruleResponse, RuleResponseEntity.class);
            if (ruleResponseEntity.getStatus().equals("failure")) {
                RuleError ruleError = ruleResponseEntity.getError();
                saveRuleError(ruleFailureLog, ruleError.getMessage(), ruleError.getStack());
            }
            return ruleResponseEntity;
        } catch (Exception e) {
            saveRuleError(ruleFailureLog, e.getMessage(), getStackTrace(e));
            return getFailureRuleResponseEntity(e);
        }
    }

    private RuleResponseEntity getFailureRuleResponseEntity(Exception e) {
        RuleResponseEntity ruleResponseEntity = new RuleResponseEntity();
        RuleError ruleError = new RuleError();
        ruleError.setMessage(e.getMessage());
        ruleError.setStack(getStackTrace(e));
        ruleResponseEntity.setStatus("failure");
        ruleResponseEntity.setError(ruleError);
        return ruleResponseEntity;
    }

    private String getStackTrace(Exception e) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        e.printStackTrace(pw);
        return sw.toString();
    }

    private void saveRuleError(RuleFailureLog ruleFailureLog, String message, String stack) {
        ruleFailureLog.setErrorMessage(message);
        ruleFailureLog.setStacktrace(stack);
        ruleFailureLogRepository.save(ruleFailureLog);
    }


}
