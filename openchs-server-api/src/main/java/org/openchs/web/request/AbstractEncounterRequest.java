package org.openchs.web.request;

import java.util.List;

public class AbstractEncounterRequest extends org.openchs.web.request.common.CommonAbstractEncounterRequest {
    protected List<ObservationRequest> observations;

    public List<ObservationRequest> getObservations() {
        return observations;
    }

    public void setObservations(List<ObservationRequest> observations) {
        this.observations = observations;
    }

    public void addObservation(ObservationRequest observationRequest) {
        if (observationRequest != null)
            this.observations.add(observationRequest);
    }
}