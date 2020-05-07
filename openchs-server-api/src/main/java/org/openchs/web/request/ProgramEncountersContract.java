package org.openchs.web.request;

import org.joda.time.DateTime;
import org.openchs.web.request.common.CommonAbstractEncounterRequest;

import java.util.List;

public class ProgramEncountersContract extends CHSRequest {
    String name;
    DateTime cancelDateTime;
    DateTime earliestVisitDateTime;
    DateTime maxVisitDateTime;
    EncounterTypeContract encounterType;
    private DateTime encounterDateTime;
    private List<ObservationContract> observations;
    private List<ObservationContract> cancelObservations;

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
}