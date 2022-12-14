package org.avni.server.web.request.rules.RulesContractWrapper;

import org.joda.time.DateTime;
import org.avni.server.domain.EntityApprovalStatus;
import org.avni.server.domain.ProgramEnrolment;
import org.avni.server.service.EntityApprovalStatusService;
import org.avni.server.service.ObservationService;
import org.avni.server.web.request.ObservationModelContract;
import org.avni.server.web.request.application.ChecklistDetailRequest;
import org.avni.server.web.request.rules.request.RuleRequestEntity;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class ProgramEnrolmentContract implements RuleServerEntityContract {
    private IndividualContract subject;
    private RuleRequestEntity rule;
    private List<VisitSchedule> visitSchedules = new ArrayList<>();
    private DateTime enrolmentDateTime;
    private DateTime programExitDateTime;
    private String uuid;
    private Boolean voided;
    private Set<ProgramEncounterContract> programEncounters = new HashSet<>();
    private List<ObservationModelContract> observations = new ArrayList<>();
    private List<ObservationModelContract> exitObservations = new ArrayList<>();
    private String operationalProgramName;
    private List<ChecklistDetailRequest> checklistDetails = new ArrayList<>();
    private EntityApprovalStatusWrapper latestEntityApprovalStatus;

    public EntityApprovalStatusWrapper getLatestEntityApprovalStatus() {
        return latestEntityApprovalStatus;
    }

    public void setLatestEntityApprovalStatus(EntityApprovalStatusWrapper latestEntityApprovalStatus) {
        this.latestEntityApprovalStatus = latestEntityApprovalStatus;
    }

    public List<ChecklistDetailRequest> getChecklistDetails() {
        return checklistDetails;
    }

    public void setChecklistDetails(List<ChecklistDetailRequest> checklistDetails) {
        this.checklistDetails = checklistDetails;
    }

    public String getOperationalProgramName() {
        return operationalProgramName;
    }

    public void setOperationalProgramName(String operationalProgramName) {
        this.operationalProgramName = operationalProgramName;
    }

    public DateTime getEnrolmentDateTime() {
        return enrolmentDateTime;
    }

    public void setEnrolmentDateTime(DateTime enrolmentDateTime) {
        this.enrolmentDateTime = enrolmentDateTime;
    }

    public DateTime getProgramExitDateTime() {
        return programExitDateTime;
    }

    public void setProgramExitDateTime(DateTime programExitDateTime) {
        this.programExitDateTime = programExitDateTime;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public Boolean getVoided() {
        return voided;
    }

    public void setVoided(Boolean voided) {
        this.voided = voided;
    }

    public Set<ProgramEncounterContract> getProgramEncounters() {
        return programEncounters;
    }

    public void setProgramEncounters(Set<ProgramEncounterContract> programEncounters) {
        this.programEncounters = programEncounters;
    }

    public List<ObservationModelContract> getObservations() {
        return observations;
    }

    public void setObservations(List<ObservationModelContract> observations) {
        this.observations = observations;
    }

    public List<ObservationModelContract> getExitObservations() {
        return exitObservations;
    }

    public void setExitObservations(List<ObservationModelContract> exitObservations) {
        this.exitObservations = exitObservations;
    }

    public RuleRequestEntity getRule() {
        return rule;
    }

    public void setRule(RuleRequestEntity rule) {
        this.rule = rule;
    }

    public IndividualContract getSubject() {
        return subject;
    }

    public void setSubject(IndividualContract subject) {
        this.subject = subject;
    }

    public List<VisitSchedule> getVisitSchedules() {
        return visitSchedules;
    }

    public void setVisitSchedules(List<VisitSchedule> visitSchedules) {
        this.visitSchedules = visitSchedules;
    }

    public static ProgramEnrolmentContract fromEnrolment(ProgramEnrolment enrolment, ObservationService observationService, EntityApprovalStatusService entityApprovalStatusService) {
        ProgramEnrolmentContract contract = new ProgramEnrolmentContract();
        contract.setOperationalProgramName(enrolment.getProgram().getOperationalProgramName());
        contract.setUuid(enrolment.getUuid());
        contract.setVoided(enrolment.isVoided());
        contract.setEnrolmentDateTime(enrolment.getEnrolmentDateTime());
        contract.setProgramExitDateTime(enrolment.getProgramExitDateTime());
        contract.setOperationalProgramName(enrolment.getProgram().getOperationalProgramName());
        contract.setObservations(observationService.constructObservationModelContracts(enrolment.getObservations()));
        contract.setExitObservations(observationService.constructObservationModelContracts(enrolment.getProgramExitObservations()));
        EntityApprovalStatusWrapper latestEntityApprovalStatus = entityApprovalStatusService.getLatestEntityApprovalStatus(enrolment.getId(), EntityApprovalStatus.EntityType.ProgramEnrolment, enrolment.getUuid());
        contract.setLatestEntityApprovalStatus(latestEntityApprovalStatus);
        return contract;
    }
}
