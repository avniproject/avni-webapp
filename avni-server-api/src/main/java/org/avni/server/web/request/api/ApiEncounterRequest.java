package org.avni.server.web.request.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.avni.server.web.api.CommonFieldNames;

public class ApiEncounterRequest extends ApiBaseEncounterRequest {
    @JsonProperty(CommonFieldNames.SUBJECT_EXTERNAL_ID)
    private String subjectExternalId;

    @JsonProperty(CommonFieldNames.SUBJECT_ID)
    private String subjectId;

    public String getSubjectId() {
        return subjectId;
    }

    public String getSubjectExternalId() { return subjectExternalId; }
}
