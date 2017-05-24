package org.openchs.web.request.keyvalue;

import org.openchs.web.request.common.CommonProgramEnrolmentRequest;

import java.util.HashMap;
import java.util.Map;

public class KeyValueProgramEnrolmentRequest extends CommonProgramEnrolmentRequest {
    private Map<String, Object> observations = new HashMap<>();
    private Map<String, Object> programExitObservations = new HashMap<>();

    public Map<String, Object> getObservations() {
        return observations;
    }

    public void setObservations(Map<String, Object> observations) {
        this.observations = observations;
    }

    public Map<String, Object> getProgramExitObservations() {
        return programExitObservations;
    }

    public void setProgramExitObservations(Map<String, Object> programExitObservations) {
        this.programExitObservations = programExitObservations;
    }
}