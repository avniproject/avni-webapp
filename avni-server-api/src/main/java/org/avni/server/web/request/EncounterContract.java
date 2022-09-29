package org.avni.server.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.joda.time.DateTime;

import java.util.ArrayList;
import java.util.List;

public class EncounterContract extends CHSRequest {
    String name;
    EncounterTypeContract encounterType;
    DateTime cancelDateTime;
    DateTime earliestVisitDateTime;
    DateTime maxVisitDateTime;
    private DateTime encounterDateTime;
    String subjectUUID;
    @JsonInclude
    private List<ObservationContract> observations = new ArrayList<>();
    @JsonInclude
    private List<ObservationContract> cancelObservations = new ArrayList<>();

    public String getName() {
        return name;
    }

    public String getSubjectUUID() {
        return subjectUUID;
    }

    public void setSubjectUUID(String subjectUUID) {
        this.subjectUUID = subjectUUID;
    }

    public List<ObservationContract> getObservations() {
        return observations;
    }

    public void setObservations(List<ObservationContract> observations) {
        this.observations = observations;
    }

    public List<ObservationContract> getCancelObservations() {
        return cancelObservations;
    }

    public void setCancelObservations(List<ObservationContract> cancelObservations) {
        this.cancelObservations = cancelObservations;
    }

    public void setName(String name) {
        this.name = name;
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

    public EncounterTypeContract getEncounterType() {
        return encounterType;
    }

    public void setEncounterType(EncounterTypeContract encounterType) {
        this.encounterType = encounterType;
    }

    public DateTime getEncounterDateTime() {
        return encounterDateTime;
    }

    public void setEncounterDateTime(DateTime encounterDateTime) {
        this.encounterDateTime = encounterDateTime;
    }
}
