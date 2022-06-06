package org.avni.web.request.api;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ApiEncounterRequest extends ApiBaseEncounterRequest {
    @JsonProperty("Subject external ID")
    private String subjectExternalId;
    @JsonProperty("Subject ID")
    private String subjectId;

    public String getSubjectId() {
        return subjectId;
    }

    public String getSubjectExternalId() { return subjectExternalId; }
}
