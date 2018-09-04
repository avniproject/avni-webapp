package org.openchs.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;

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
        if (observationRequest != null)
            this.observations.add(observationRequest);
    }

    public void addExitObservation(ObservationRequest observationRequest) {
        if (observationRequest != null)
            this.programExitObservations.add(observationRequest);
    }

    public ObservationRequest findObservation(String conceptName) {
        return observations.stream().filter(observationRequest -> observationRequest.getConceptName().equals(conceptName)).findAny().orElse(null);
    }

    public Object getObservationValue(String conceptName) {
        ObservationRequest observation = findObservation(conceptName);
        if (observation == null) return null;
        return observation.getValue();
    }
}