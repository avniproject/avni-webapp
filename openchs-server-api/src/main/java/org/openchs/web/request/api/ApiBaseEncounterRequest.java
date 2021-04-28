package org.openchs.web.request.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.joda.time.DateTime;
import org.openchs.geo.Point;

import java.util.LinkedHashMap;

import static org.openchs.web.api.CommonFieldNames.VOIDED;

public abstract class ApiBaseEncounterRequest {
    @JsonProperty("Encounter type")
    private String encounterType;

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

    @JsonProperty(VOIDED)
    private boolean voided;

    public String getEncounterType() {
        return encounterType;
    }

    public void setEncounterType(String encounterType) {
        this.encounterType = encounterType;
    }

    public Point getEncounterLocation() {
        return encounterLocation;
    }

    public Point getCancelLocation() {
        return cancelLocation;
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

    public DateTime getMaxScheduledDate() {
        return maxScheduledDate;
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

    public boolean isVoided() {
        return voided;
    }
}