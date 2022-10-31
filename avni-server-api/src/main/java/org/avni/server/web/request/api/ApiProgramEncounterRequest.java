package org.avni.server.web.request.api;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ApiProgramEncounterRequest extends ApiBaseEncounterRequest {

    @JsonProperty("Enrolment external ID")
    private String programEnrolmentExternalId;
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

    public String getProgramEnrolmentExternalId() {
        return programEnrolmentExternalId;
    }
}
