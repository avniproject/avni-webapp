package org.avni.server.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.joda.time.DateTime;

import java.util.ArrayList;
import java.util.List;

@JsonInclude
public class ProgramEncountersContract extends CHSRequest {
    private String name;
    private DateTime cancelDateTime;
    private DateTime earliestVisitDateTime;
    private DateTime maxVisitDateTime;
    private EntityTypeContract encounterType;
    private DateTime encounterDateTime;
    private List<ObservationContract> observations = new ArrayList<>();
    private List<ObservationContract> cancelObservations = new ArrayList<>();
    private String subjectUUID;

    public String getEnrolmentUUID() {
        return enrolmentUUID;
    }

    public void setEnrolmentUUID(String enrolmentUUID) {
        this.enrolmentUUID = enrolmentUUID;
    }

    private String enrolmentUUID;

    public String getName() {
        return name;
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

    public EntityTypeContract getEncounterType() {
        return encounterType;
    }

    public void setEncounterType(EntityTypeContract encounterType) {
        this.encounterType = encounterType;
    }

    public DateTime getEncounterDateTime() {
        return encounterDateTime;
    }

    public void setEncounterDateTime(DateTime encounterDateTime) {
        this.encounterDateTime = encounterDateTime;
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

    public String getSubjectUUID() {
        return subjectUUID;
    }

    public void setSubjectUUID(String subjectUUID) {
        this.subjectUUID = subjectUUID;
    }
}
