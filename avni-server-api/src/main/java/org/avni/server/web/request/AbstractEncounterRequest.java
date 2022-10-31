package org.avni.server.web.request;

import org.joda.time.DateTime;
import org.avni.server.web.request.common.CommonAbstractEncounterRequest;

import java.util.ArrayList;
import java.util.List;

public class AbstractEncounterRequest extends CommonAbstractEncounterRequest {
    private List<ObservationRequest> observations;
    private List<ObservationRequest> cancelObservations;
    private String name;
    private DateTime maxDateTime;
    private DateTime earliestVisitDateTime;
    private DateTime maxVisitDateTime;
    private DateTime cancelDateTime;
    private PointRequest encounterLocation;
    private PointRequest cancelLocation;

    public List<ObservationRequest> getObservations() {
        return observations;
    }

    public void setObservations(List<ObservationRequest> observations) {
        this.observations = observations;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public DateTime getMaxDateTime() {
        return maxDateTime;
    }

    public void setMaxDateTime(DateTime maxDateTime) {
        this.maxDateTime = maxDateTime;
    }

    public DateTime getEarliestVisitDateTime() {
        return earliestVisitDateTime;
    }

    public void setEarliestVisitDateTime(DateTime earliestVisitDateTime) {
        this.earliestVisitDateTime = earliestVisitDateTime;
    }

    public DateTime getCancelDateTime() {
        return cancelDateTime;
    }

    public void setCancelDateTime(DateTime cancelDateTime) {
        this.cancelDateTime = cancelDateTime;
    }

    public List<ObservationRequest> getCancelObservations() {
        if (cancelObservations == null) return new ArrayList<>();
        return cancelObservations;
    }

    public void setCancelObservations(List<ObservationRequest> cancelObservations) {
        this.cancelObservations = cancelObservations;
    }

    public DateTime getMaxVisitDateTime() {
        return maxVisitDateTime;
    }

    public void setMaxVisitDateTime(DateTime maxVisitDateTime) {
        this.maxVisitDateTime = maxVisitDateTime;
    }

    public ObservationRequest findObservation(String conceptName) {
        return observations.stream().filter(observationRequest -> observationRequest.getConceptName().equals(conceptName)).findAny().orElse(null);
    }

    public void addObservation(ObservationRequest observationRequest) {
        if(observationRequest != null) {
            if (this.cancelDateTime != null) {
                this.cancelObservations.add(observationRequest);
            } else {
                this.observations.add(observationRequest);
            }
        }
    }

    public Object getObservationValue(String conceptName) {
        return findObservation(conceptName).getValue();
    }

    public PointRequest getEncounterLocation() {
        return encounterLocation;
    }

    public void setEncounterLocation(PointRequest encounterLocation) {
        this.encounterLocation = encounterLocation;
    }

    public PointRequest getCancelLocation() {
        return cancelLocation;
    }

    public void setCancelLocation(PointRequest cancelLocation) {
        this.cancelLocation = cancelLocation;
    }

    public boolean isPlanned() {
        return getEncounterDateTime() == null && getEarliestVisitDateTime() != null;
    }
}
