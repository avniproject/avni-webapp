package org.openchs.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.joda.time.DateTime;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProgramEnrolmentRequest extends org.openchs.web.request.common.CommonProgramEnrolmentRequest {
    private List<ObservationRequest> observations;
    private List<ObservationRequest> programExitObservations;

    public List<ObservationRequest> getObservations() {
        return observations;
    }

    public void setObservations(List<ObservationRequest> observations) {
        this.observations = observations;
    }

    public List<ObservationRequest> getProgramExitObservations() {
        return programExitObservations;
    }

    public void setProgramExitObservations(List<ObservationRequest> programExitObservations) {
        this.programExitObservations = programExitObservations;
    }

    public void addObservation(ObservationRequest observationRequest) {
        this.observations.add(observationRequest);
    }
}