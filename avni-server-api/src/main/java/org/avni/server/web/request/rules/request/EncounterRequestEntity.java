package org.avni.server.web.request.rules.request;

import org.joda.time.DateTime;

import java.util.List;

public class EncounterRequestEntity {
    private String uuid;

    private boolean voided;

    private String encounterTypeUUID;

    private List<ObservationRequestEntity> observations;

    private DateTime encounterDateTime;

    private List<ObservationRequestEntity> cancelObservations;

    private String individualUUID;

    private DateTime cancelDateTime;

    private DateTime earliestVisitDateTime;

    private DateTime maxVisitDateTime;

    private String name;

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

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public boolean isVoided() {
        return voided;
    }

    public void setVoided(boolean voided) {
        this.voided = voided;
    }

    public String getEncounterTypeUUID() {
        return encounterTypeUUID;
    }

    public void setEncounterTypeUUID(String encounterTypeUUID) {
        this.encounterTypeUUID = encounterTypeUUID;
    }

    public List<ObservationRequestEntity> getObservations() {
        return observations;
    }

    public void setObservations(List<ObservationRequestEntity> observations) {
        this.observations = observations;
    }

    public DateTime getEncounterDateTime() {
        return encounterDateTime;
    }

    public void setEncounterDateTime(DateTime encounterDateTime) {
        this.encounterDateTime = encounterDateTime;
    }

    public List<ObservationRequestEntity> getCancelObservations() {
        return cancelObservations;
    }

    public void setCancelObservations(List<ObservationRequestEntity> cancelObservations) {
        this.cancelObservations = cancelObservations;
    }

    public String getIndividualUUID() {
        return individualUUID;
    }

    public void setIndividualUUID(String individualUUID) {
        this.individualUUID = individualUUID;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
