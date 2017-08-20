package org.openchs.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.joda.time.LocalDate;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class IndividualRequest extends org.openchs.web.request.common.CommonIndividualRequest {
    private List<ObservationRequest> observations;

    public List<ObservationRequest> getObservations() {
        return observations;
    }

    public void setObservations(List<ObservationRequest> observations) {
        this.observations = observations;
    }

    public void addObservation(ObservationRequest observationRequest) {
        this.observations.add(observationRequest);
    }
}