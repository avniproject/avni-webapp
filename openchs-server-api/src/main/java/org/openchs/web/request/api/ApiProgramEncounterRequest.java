package org.openchs.web.request.api;

public class ApiProgramEncounterRequest extends ApiBaseEncounterRequest {
    @JsonProperty("Enrolment ID")
    private String enrolmentId;

    @JsonProperty("Program")
    private String program;

    @Override
    public String getProgram() {
        return program;
    }

    public String getEnrolmentId() {
        return enrolmentId;
    }
}