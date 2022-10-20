package org.avni.server.web;

import org.avni.server.application.FormMapping;
import org.avni.server.dao.application.FormMappingRepository;
import org.avni.server.domain.*;
import org.avni.server.service.IndividualService;
import org.avni.server.web.request.EncounterContract;
import org.avni.server.web.request.ProgramEncountersContract;
import org.avni.server.web.request.RuleDependencyRequest;
import org.avni.server.web.request.RuleRequest;
import org.avni.server.web.request.rules.request.RequestEntityWrapper;
import org.avni.server.web.request.rules.response.EligibilityRuleEntity;
import org.avni.server.web.request.rules.response.EligibilityRuleResponseEntity;
import org.avni.server.web.request.rules.response.RuleResponseEntity;
import org.avni.server.web.validation.ValidationException;
import org.codehaus.jettison.json.JSONException;
import org.avni.server.dao.IndividualRepository;
import org.avni.server.dao.ProgramEnrolmentRepository;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.service.RuleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
public class RuleController {
    private final Logger logger;
    private final RuleService ruleService;
    private final ProgramEnrolmentRepository programEnrolmentRepository;
    private final IndividualRepository individualRepository;
    private final FormMappingRepository formMappingRepository;
    private final IndividualService individualService;

    @Autowired
    public RuleController(RuleService ruleService,
                          ProgramEnrolmentRepository programEnrolmentRepository,
                          IndividualRepository individualRepository,
                          FormMappingRepository formMappingRepository, IndividualService individualService) {
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.individualRepository = individualRepository;
        this.formMappingRepository = formMappingRepository;
        this.individualService = individualService;
        logger = LoggerFactory.getLogger(this.getClass());
        this.ruleService = ruleService;
    }

    @RequestMapping(value = "/ruleDependency", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public ResponseEntity<?> saveDependency(@RequestBody RuleDependencyRequest ruleDependency) {
        logger.info(String.format("Creating rule dependency for: %s", UserContextHolder.getUserContext().getOrganisation().getName()));
        return new ResponseEntity<>(ruleService.createDependency(ruleDependency.getCode(), ruleDependency.getHash()).getUuid(),
                HttpStatus.CREATED);
    }

    @RequestMapping(value = "/rules", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public ResponseEntity<?> saveRules(@RequestBody List<RuleRequest> ruleRequests) {
        logger.info(String.format("Creating rules for: %s", UserContextHolder.getUserContext().getOrganisation().getName()));
        try {
            ruleService.createOrUpdate(ruleRequests);
        } catch (ValidationException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @RequestMapping(value = "/rule", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public ResponseEntity<?> saveRule(@RequestBody RuleRequest ruleRequest) {
        logger.info(String.format("Creating rules for: %s", UserContextHolder.getUserContext().getOrganisation().getName()));
        ruleService.createOrUpdate(ruleRequest);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @RequestMapping(value = "/web/rules", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    ResponseEntity<?> executeServerSideRules(@RequestBody RequestEntityWrapper requestEntityWrapper) {
        RuleResponseEntity ruleResponseEntity = ruleService.executeServerSideRules(requestEntityWrapper);
        if (ruleResponseEntity.getStatus().equalsIgnoreCase("success")) {
            return ResponseEntity.ok().body(ruleResponseEntity);
        } else if (HttpStatus.NOT_FOUND.toString().equals(ruleResponseEntity.getStatus())) {
            return new ResponseEntity<>(ruleResponseEntity, HttpStatus.NOT_FOUND);
        } else {
            return ResponseEntity.badRequest().body(ruleResponseEntity);
        }
    }

    @RequestMapping(value = "/web/programSummaryRule", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    ResponseEntity<?> programSummaryRule(@RequestParam String programEnrolmentUUID) {
        ProgramEnrolment programEnrolment = programEnrolmentRepository.findByUuid(programEnrolmentUUID);
        RuleResponseEntity ruleResponseEntity = ruleService.executeProgramSummaryRule(programEnrolment);
        if (ruleResponseEntity.getStatus().equalsIgnoreCase("success")) {
            return ResponseEntity.ok().body(ruleResponseEntity);
        } else if (HttpStatus.NOT_FOUND.toString().equals(ruleResponseEntity.getStatus())) {
            return new ResponseEntity<>(ruleResponseEntity, HttpStatus.NOT_FOUND);
        } else {
            return ResponseEntity.badRequest().body(ruleResponseEntity);
        }
    }

    @RequestMapping(value = "/web/subjectSummaryRule", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    ResponseEntity<?> subjectSummaryRule(@RequestParam String subjectUUID) {
        Individual individual = individualRepository.findByUuid(subjectUUID);
        RuleResponseEntity ruleResponseEntity = ruleService.executeSubjectSummaryRule(individual);
        if (ruleResponseEntity.getStatus().equalsIgnoreCase("success")) {
            return ResponseEntity.ok().body(ruleResponseEntity);
        } else if (HttpStatus.NOT_FOUND.toString().equals(ruleResponseEntity.getStatus())) {
            return new ResponseEntity<>(ruleResponseEntity, HttpStatus.NOT_FOUND);
        } else {
            return ResponseEntity.badRequest().body(ruleResponseEntity);
        }
    }

    @RequestMapping(value = "/web/eligibleGeneralEncounters", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    ResponseEntity<?> getEligibleGeneralEncounters(@RequestParam String subjectUUID) {
        Individual individual = individualRepository.findByUuid(subjectUUID);
        List<FormMapping> formMappings = formMappingRepository.getAllGeneralEncounterFormMappings();
        List<EncounterType> encounterTypes = formMappings.stream()
                .filter(fm -> fm.getSubjectTypeUuid().equals(individual.getSubjectType().getUuid()))
                .map(FormMapping::getEncounterType).collect(Collectors.toList());
        Stream<Encounter> scheduledEncountersStream = individual
                .getEncounters()
                .stream()
                .filter(enc -> !enc.isVoided() && enc.getEncounterDateTime() == null && enc.getCancelDateTime() == null);
        Set<EncounterContract> scheduledEncounters = individualService.constructEncounters(scheduledEncountersStream);
        JsonObject response = new JsonObject().with("scheduledEncounters", scheduledEncounters);
        logger.info(String.format("Executing encounter Eligibility rule for the subject uuid %s", subjectUUID));
        EligibilityRuleResponseEntity ruleResponse = ruleService.executeEligibilityRule(individual, encounterTypes);
        addEligibleEncounterUUIDsToResponse(response, ruleResponse, encounterTypes);
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value = "/web/eligibleProgramEncounters", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    ResponseEntity<?> getEligibleProgramEncounters(@RequestParam String enrolmentUUID) {
        ProgramEnrolment programEnrolment = programEnrolmentRepository.findByUuid(enrolmentUUID);
        List<FormMapping> formMappings = formMappingRepository.getAllProgramEncounterFormMappings();
        List<EncounterType> encounterTypes = formMappings.stream()
                .filter(fm -> fm.getProgramUuid().equals(programEnrolment.getProgram().getUuid()))
                .map(FormMapping::getEncounterType).collect(Collectors.toList());
        Stream<ProgramEncounter> scheduledEncountersStream = programEnrolment
                .getEncounters(true)
                .filter(enc -> !enc.isVoided() && enc.getEncounterDateTime() == null && enc.getCancelDateTime() == null);
        Set<ProgramEncountersContract> scheduledEncounters = individualService.constructProgramEncounters(scheduledEncountersStream);
        JsonObject response = new JsonObject().with("scheduledEncounters", scheduledEncounters);
        logger.info(String.format("Executing encounter Eligibility rule for the enrolment uuid %s", enrolmentUUID));
        EligibilityRuleResponseEntity ruleResponse = ruleService.executeEligibilityRule(programEnrolment.getIndividual(), encounterTypes);
        addEligibleEncounterUUIDsToResponse(response, ruleResponse, encounterTypes);
        return ResponseEntity.ok().body(response);
    }

    private void addEligibleEncounterUUIDsToResponse(JsonObject response, EligibilityRuleResponseEntity ruleResponse, List<EncounterType> encounterTypes) {
        if (ruleResponse.getStatus().equalsIgnoreCase("success")) {
            List<String> eligibleEncounterTypeUUIDs = ruleResponse.getEligibilityRuleEntities()
                    .stream()
                    .filter(EligibilityRuleEntity::isEligible)
                    .map(EligibilityRuleEntity::getTypeUUID)
                    .collect(Collectors.toList());
            response.with("eligibleEncounterTypeUUIDs", eligibleEncounterTypeUUIDs);
        } else {
            List<String> encounterTypeUUIDS = encounterTypes.stream().map(CHSBaseEntity::getUuid).collect(Collectors.toList());
            response.with("eligibleEncounterTypeUUIDs", encounterTypeUUIDS);
        }
    }
}
