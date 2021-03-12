package org.openchs.web.request.api;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ApiProgramEncounterRequest extends ApiBaseEncounterRequest {
    @JsonProperty("Enrolment ID")
    private String enrolmentId;

    @JsonProperty("Program")
    private String program;

    public String getProgram() {
        return program;
    }

    public String getEnrolmentId() {
        return enrolmentId;
    }
}