package org.openchs.web.request.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.joda.time.DateTime;
import org.openchs.geo.Point;

import java.util.LinkedHashMap;

public class ApiEncounterRequest {
    @JsonProperty("Encounter type")
    private String encounterType;

    @JsonProperty("Subject ID")
    private String subjectId;

    @JsonProperty("Encounter location")
    private Point encounterLocation;

    @JsonProperty("Cancel location")
    private Point cancelLocation;

    @JsonProperty("Encounter date time")
    private DateTime encounterDateTime;

    @JsonProperty("Earliest scheduled date")
    private DateTime earliestScheduledDate;

    @JsonProperty("Max scheduled date")
    private DateTime maxScheduledDate;

    @JsonProperty("Cancel date time")
    private DateTime cancelDateTime;

    @JsonProperty("observations")
    private LinkedHashMap<String, Object> observations;

    @JsonProperty("cancelObservations")
    private LinkedHashMap<String, Object> cancelObservations;


    public String getEncounterType() {
        return encounterType;
    }

    public void setEncounterType(String encounterType) {
        this.encounterType = encounterType;
    }

    public String getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(String subjectId) {
        this.subjectId = subjectId;
    }

    public Point getEncounterLocation() {
        return encounterLocation;
    }

    public void setEncounterLocation(Point encounterLocation) {
        this.encounterLocation = encounterLocation;
    }

    public Point getCancelLocation() {
        return cancelLocation;
    }

    public void setCancelLocation(Point cancelLocation) {
        this.cancelLocation = cancelLocation;
    }

    public DateTime getEncounterDateTime() {
        return encounterDateTime;
    }

    public void setEncounterDateTime(DateTime encounterDateTime) {
        this.encounterDateTime = encounterDateTime;
    }

    public DateTime getEarliestScheduledDate() {
        return earliestScheduledDate;
    }

    public void setEarliestScheduledDate(DateTime earliestScheduledDate) {
        this.earliestScheduledDate = earliestScheduledDate;
    }

    public DateTime getMaxScheduledDate() {
        return maxScheduledDate;
    }

    public void setMaxScheduledDate(DateTime maxScheduledDate) {
        this.maxScheduledDate = maxScheduledDate;
    }

    public DateTime getCancelDateTime() {
        return cancelDateTime;
    }

    public void setCancelDateTime(DateTime cancelDateTime) {
        this.cancelDateTime = cancelDateTime;
    }

    public LinkedHashMap<String, Object> getObservations() {
        return observations;
    }

    public void setObservations(LinkedHashMap<String, Object> observations) {
        this.observations = observations;
    }

    public LinkedHashMap<String, Object> getCancelObservations() {
        return cancelObservations;
    }

    public void setCancelObservations(LinkedHashMap<String, Object> cancelObservations) {
        this.cancelObservations = cancelObservations;
    }
}