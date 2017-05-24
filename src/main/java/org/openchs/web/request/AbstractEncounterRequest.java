package org.openchs.web.request;

import java.util.List;

public class AbstractEncounterRequest extends org.openchs.web.request.common.CommonAbstractEncounterRequest {
    private List<ObservationRequest> observations;

    public List<ObservationRequest> getObservations() {
        return observations;
    }

    public void setObservations(List<ObservationRequest> observations) {
        this.observations = observations;
    }
}