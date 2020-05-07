package org.openchs.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.codehaus.jettison.json.JSONException;
import org.openchs.application.RuleType;
import org.openchs.dao.*;
import org.openchs.dao.application.FormRepository;
import org.openchs.domain.*;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.web.RestClient;
import org.openchs.web.request.RuleRequest;
import org.openchs.web.request.rules.RulesContractWrapper.EncounterContractWrapper;
import org.openchs.web.request.rules.RulesContractWrapper.IndividualContractWrapper;
import org.openchs.web.request.rules.RulesContractWrapper.ProgramEncounterContractWrapper;
import org.openchs.web.request.rules.RulesContractWrapper.ProgramEnrolmentContractWrapper;
import org.openchs.web.request.rules.constructWrappers.IndividualConstructionService;
import org.openchs.web.request.rules.constructWrappers.ObservationConstructionService;
import org.openchs.web.request.rules.constructWrappers.ProgramEncounterConstructionService;
import org.openchs.web.request.rules.constructWrappers.ProgramEnrolmentConstructionService;
import org.openchs.web.request.rules.request.RequestEntityWrapper;
import org.openchs.web.request.rules.response.RuleResponseEntity;
import org.openchs.web.request.rules.validateRules.DecisionRuleValidation;
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
    private final DecisionRuleValidation decisionRuleValidation;
    private final ProgramEncounterConstructionService programEncounterConstructionService;
    private final ProgramEnrolmentConstructionService programEnrolmentConstructionService;
    private final ObservationConstructionService observationConstructionService;

    @Autowired
    public RuleService(RuleDependencyRepository ruleDependencyRepository,
                       RuleRepository ruleRepository,
                       FormRepository formRepository,
                       ProgramRepository programRepository,
                       EncounterTypeRepository encounterTypeRepository,
                       ProgramEnrolmentRepository programEnrolmentRepository,
                       RestClient restClient,
                       IndividualConstructionService individualConstructionService,
                       DecisionRuleValidation decisionRuleValidation,
                       ProgramEncounterConstructionService programEncounterConstructionService,
                       ProgramEnrolmentConstructionService programEnrolmentConstructionService,
                       ObservationConstructionService observationConstructionService
    ) {
        logger = LoggerFactory.getLogger(this.getClass());
        this.ruleDependencyRepository = ruleDependencyRepository;
        this.ruleRepository = ruleRepository;
        this.ruledEntityRepositories = new HashMap<RuledEntityType, CHSRepository>(){{
            put(RuledEntityType.Form, formRepository);
            put(RuledEntityType.Program, programRepository);
            put(RuledEntityType.EncounterType, encounterTypeRepository);
        }};
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.restClient = restClient;
        this.individualConstructionService = individualConstructionService;
        this.decisionRuleValidation = decisionRuleValidation;
        this.programEncounterConstructionService = programEncounterConstructionService;
        this.programEnrolmentConstructionService = programEnrolmentConstructionService;
        this.observationConstructionService = observationConstructionService;
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

    public RuleResponseEntity decisionRuleProgramEnrolmentWorkFlow(RequestEntityWrapper requestEntityWrapper){
        ProgramEnrolmentContractWrapper programEnrolmentContractWrapper = programEnrolmentConstructionService.constructProgramEnrolmentContract(requestEntityWrapper.getProgramEnrolmentRequestEntity());
        programEnrolmentContractWrapper.setRule(requestEntityWrapper.getRule());
        RuleFailureLog ruleFailureLog = decisionRuleValidation.generateRuleFailureLog(requestEntityWrapper,"Web","Program Enrolment",requestEntityWrapper.getProgramEnrolmentRequestEntity().getUuid());
        RuleResponseEntity ruleResponseEntity = createHttpHeaderAndSendRequest("/api/program_enrolment_rule",programEnrolmentContractWrapper,ruleFailureLog);
        ruleResponseEntity.getData().setEnrolmentDecisions(decisionRuleValidation.validateDecision(ruleResponseEntity.getData().getEnrolmentDecisions(),ruleFailureLog));
        ruleResponseEntity.setObservation(observationConstructionService.responseObservation(ruleResponseEntity.getData().getEnrolmentDecisions()));
        return ruleResponseEntity;
    }

    public RuleResponseEntity decisionRuleEncounterWorkFlow(RequestEntityWrapper requestEntityWrapper){
        EncounterContractWrapper encounterContractWrapper = programEncounterConstructionService.constructEncounterContract(requestEntityWrapper.getEncounterRequestEntity());
        encounterContractWrapper.setRule(requestEntityWrapper.getRule());
        RuleFailureLog ruleFailureLog = decisionRuleValidation.generateRuleFailureLog(requestEntityWrapper,"Web","Encounter",requestEntityWrapper.getEncounterRequestEntity().getUuid());
        RuleResponseEntity ruleResponseEntity = createHttpHeaderAndSendRequest("/api/encounter_rule",encounterContractWrapper,ruleFailureLog);
        ruleResponseEntity.getData().setEncounterDecisions(decisionRuleValidation.validateDecision(ruleResponseEntity.getData().getEncounterDecisions(),ruleFailureLog));
        ruleResponseEntity.setObservation(observationConstructionService.responseObservation(ruleResponseEntity.getData().getEncounterDecisions()));
        return ruleResponseEntity;
    }

    public RuleResponseEntity decisionRuleProgramEncounterWorkFlow(RequestEntityWrapper requestEntityWrapper){
        ProgramEncounterContractWrapper programEncounterContractWrapper = programEncounterConstructionService.constructProgramEncounterContract(requestEntityWrapper.getProgramEncounterRequestEntity());
        programEncounterContractWrapper.setRule(requestEntityWrapper.getRule());
        RuleFailureLog ruleFailureLog = decisionRuleValidation.generateRuleFailureLog(requestEntityWrapper,"Web","Program Encounter",requestEntityWrapper.getProgramEncounterRequestEntity().getUuid());
        RuleResponseEntity ruleResponseEntity = createHttpHeaderAndSendRequest("/api/program_encounter_rule",programEncounterContractWrapper,ruleFailureLog);
        ruleResponseEntity.getData().setEncounterDecisions(decisionRuleValidation.validateDecision(ruleResponseEntity.getData().getEncounterDecisions(),ruleFailureLog));
        ruleResponseEntity.setObservation(observationConstructionService.responseObservation(ruleResponseEntity.getData().getEncounterDecisions()));
        return ruleResponseEntity;
    }

    public RuleResponseEntity decisionRuleIndividualWorkFlow(RequestEntityWrapper requestEntityWrapper) throws IOException, JSONException {
        IndividualContractWrapper individualContractWrapper = individualConstructionService.constructIndividualContract(requestEntityWrapper.getIndividualRequestEntity());
        individualContractWrapper.setRule(requestEntityWrapper.getRule());
        RuleFailureLog ruleFailureLog = decisionRuleValidation.generateRuleFailureLog(requestEntityWrapper,"Web","Individual",requestEntityWrapper.getIndividualRequestEntity().getUuid());
        RuleResponseEntity ruleResponseEntity = createHttpHeaderAndSendRequest("/api/individual_rule",individualContractWrapper,ruleFailureLog);
        ruleResponseEntity.getData().setRegistrationDecisions(decisionRuleValidation.validateDecision(ruleResponseEntity.getData().getRegistrationDecisions(),ruleFailureLog));
        ruleResponseEntity.setObservation(observationConstructionService.responseObservation(ruleResponseEntity.getData().getRegistrationDecisions()));

        return ruleResponseEntity;
    }

    private RuleResponseEntity createHttpHeaderAndSendRequest(String url, Object contractObject,RuleFailureLog ruleFailureLog){
        try {
            ObjectMapper mapper = new ObjectMapper();
            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.setContentType(MediaType.APPLICATION_JSON);
            String decisionResponse = restClient.post(url,contractObject,httpHeaders);
            RuleResponseEntity ruleResponseEntity = mapper.readValue(decisionResponse, RuleResponseEntity.class);
            return ruleResponseEntity;
        }
        catch (Exception e){
            RuleResponseEntity ruleResponseEntity = new RuleResponseEntity();
            ruleResponseEntity.setMessage("SomeThing went wrong at server side");
            ruleResponseEntity.setStatus("failure");
            return ruleResponseEntity;
        }
    }


}