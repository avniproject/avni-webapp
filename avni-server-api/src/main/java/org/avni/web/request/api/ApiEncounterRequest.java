package org.avni.web.request.api;

import com.fasterxml.jackson.annotation.JsonProperty;

import static org.avni.web.api.CommonFieldNames.SUBJECT_EXTERNAL_ID;
import static org.avni.web.api.CommonFieldNames.SUBJECT_ID;

public class ApiEncounterRequest extends ApiBaseEncounterRequest {
    @JsonProperty(SUBJECT_EXTERNAL_ID)
    private String subjectExternalId;

    @JsonProperty(SUBJECT_ID)
    private String subjectId;

    public String getSubjectId() {
        return subjectId;
    }

    public String getSubjectExternalId() { return subjectExternalId; }
}
