package org.avni.web.request.api;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ApiEncounterRequest extends ApiBaseEncounterRequest {
    @JsonProperty("Subject ID")
    private String subjectId;

    public String getSubjectId() {
        return subjectId;
    }
}
