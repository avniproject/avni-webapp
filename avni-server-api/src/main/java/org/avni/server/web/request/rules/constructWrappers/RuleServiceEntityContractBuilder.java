package org.avni.server.web.request.rules.constructWrappers;

import org.avni.server.domain.*;
import org.avni.server.service.EntityApprovalStatusService;
import org.avni.server.service.ObservationService;
import org.avni.server.web.request.rules.RulesContractWrapper.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RuleServiceEntityContractBuilder {
    private ObservationService observationService;
    private EntityApprovalStatusService entityApprovalStatusService;
    private ProgramEncounterConstructionService programEncounterConstructionService;
    private IndividualConstructionService individualConstructionService;

    @Autowired
    public RuleServiceEntityContractBuilder(ObservationService observationService, EntityApprovalStatusService entityApprovalStatusService, ProgramEncounterConstructionService programEncounterConstructionService, IndividualConstructionService individualConstructionService) {
        this.observationService = observationService;
        this.entityApprovalStatusService = entityApprovalStatusService;
        this.programEncounterConstructionService = programEncounterConstructionService;
        this.individualConstructionService = individualConstructionService;
    }

    public ProgramEnrolmentContract toContract(ProgramEnrolment programEnrolment) {
        ProgramEnrolmentContract programEnrolmentContract = ProgramEnrolmentContract.fromEnrolment(programEnrolment, observationService, entityApprovalStatusService);
        Set<ProgramEncounterContract> programEncountersContracts = programEnrolment.getProgramEncounters().stream().map(programEncounterConstructionService::constructProgramEncounterContractWrapper).collect(Collectors.toSet());
        programEnrolmentContract.setProgramEncounters(programEncountersContracts);
        programEnrolmentContract.setSubject(individualConstructionService.getSubjectInfo(programEnrolment.getIndividual()));
        return programEnrolmentContract;
    }

    public IndividualContract toContract(Individual individual) {
        return individualConstructionService.getSubjectInfo(individual);
    }

    public ProgramEncounterContract toContract(ProgramEncounter programEncounter) {
        return programEncounterConstructionService.constructProgramEncounterContractWrapper(programEncounter);
    }

    public EncounterContract toContract(Encounter encounter) {
        EncounterContract encounterContract = EncounterContract.fromEncounter(encounter, observationService, entityApprovalStatusService);
        encounterContract.setSubject(individualConstructionService.getSubjectInfo(encounter.getIndividual()));
        return encounterContract;
    }

    public RuleServerEntityContract toContract(String entityType, CHSEntity entity) {
        switch (entityType) {
            case "Subject":
                return toContract((Individual) entity);
            case "ProgramEnrolment":
                return toContract((ProgramEnrolment) entity);
            case "Encounter":
                return toContract((Encounter) entity);
            case "ProgramEncounter":
                return toContract((ProgramEncounter) entity);
            default:
                throw new IllegalArgumentException("Unknown entityType " + entityType);
        }
    }
}
