package org.avni.web.request.rules.RulesContractWrapper;

import org.joda.time.DateTime;
import org.avni.domain.Encounter;
import org.avni.domain.EntityApprovalStatus;
import org.avni.service.EntityApprovalStatusService;
import org.avni.service.ObservationService;
import org.avni.web.request.EncounterTypeContract;
import org.avni.web.request.ObservationModelContract;
import org.avni.web.request.rules.request.RuleRequestEntity;

import java.util.List;

public class EncounterContractWrapper {
    private List<ObservationModelContract> observations;
    private RuleRequestEntity rule;
    private IndividualContractWrapper subject;
    private String uuid;
    private String name;
    private EncounterTypeContract encounterType;
    private DateTime cancelDateTime;
    private DateTime earliestVisitDateTime;
    private DateTime maxVisitDateTime;
    private DateTime encounterDateTime;
    private List<ObservationModelContract> cancelObservations;
    private Boolean voided;
    private List<VisitSchedule> visitSchedules;
    private EntityApprovalStatusWrapper latestEntityApprovalStatus;

    public EntityApprovalStatusWrapper getLatestEntityApprovalStatus() {
        return latestEntityApprovalStatus;
    }

    public void setLatestEntityApprovalStatus(EntityApprovalStatusWrapper latestEntityApprovalStatus) {
        this.latestEntityApprovalStatus = latestEntityApprovalStatus;
    }

    public Boolean getVoided() {
        return voided;
    }

    public void setVoided(Boolean voided) {
        this.voided = voided;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public EncounterTypeContract getEncounterType() {
        return encounterType;
    }

    public void setEncounterType(EncounterTypeContract encounterType) {
        this.encounterType = encounterType;
    }

    public DateTime getCancelDateTime() {
        return cancelDateTime;
    }

    public void setCancelDateTime(DateTime cancelDateTime) {
        this.cancelDateTime = cancelDateTime;
    }

    public DateTime getEarliestVisitDateTime() {
        return earliestVisitDateTime;
    }

    public void setEarliestVisitDateTime(DateTime earliestVisitDateTime) {
        this.earliestVisitDateTime = earliestVisitDateTime;
    }

    public DateTime getMaxVisitDateTime() {
        return maxVisitDateTime;
    }

    public void setMaxVisitDateTime(DateTime maxVisitDateTime) {
        this.maxVisitDateTime = maxVisitDateTime;
    }

    public DateTime getEncounterDateTime() {
        return encounterDateTime;
    }

    public void setEncounterDateTime(DateTime encounterDateTime) {
        this.encounterDateTime = encounterDateTime;
    }

    public List<ObservationModelContract> getCancelObservations() {
        return cancelObservations;
    }

    public void setCancelObservations(List<ObservationModelContract> cancelObservations) {
        this.cancelObservations = cancelObservations;
    }

    public List<ObservationModelContract> getObservations() {
        return observations;
    }

    public void setObservations(List<ObservationModelContract> observations) {
        this.observations = observations;
    }

    public RuleRequestEntity getRule() {
        return rule;
    }

    public void setRule(RuleRequestEntity rule) {
        this.rule = rule;
    }

    public IndividualContractWrapper getSubject() {
        return subject;
    }

    public void setSubject(IndividualContractWrapper subject) {
        this.subject = subject;
    }

    public static EncounterContractWrapper fromEncounter(Encounter encounter, ObservationService observationService, EntityApprovalStatusService entityApprovalStatusService) {
        EncounterContractWrapper contract = new EncounterContractWrapper();
        contract.setUuid(encounter.getUuid());
        contract.setName(encounter.getName());
        contract.setEncounterDateTime(encounter.getEncounterDateTime());
        contract.setEarliestVisitDateTime(encounter.getEarliestVisitDateTime());
        contract.setMaxVisitDateTime(encounter.getMaxVisitDateTime());
        contract.setCancelDateTime(encounter.getCancelDateTime());
        contract.setObservations(observationService.constructObservationModelContracts(encounter.getObservations()));
        contract.setEncounterType(EncounterTypeContract.fromEncounterType(encounter.getEncounterType()));
        EntityApprovalStatusWrapper latestEntityApprovalStatus = entityApprovalStatusService.getLatestEntityApprovalStatus(encounter.getId(), EntityApprovalStatus.EntityType.Encounter, encounter.getUuid());
        contract.setLatestEntityApprovalStatus(latestEntityApprovalStatus);
        return contract;
    }

    public List<VisitSchedule> getVisitSchedules() {
        return visitSchedules;
    }

    public void setVisitSchedules(List<VisitSchedule> visitSchedules) {
        this.visitSchedules = visitSchedules;
    }
}
