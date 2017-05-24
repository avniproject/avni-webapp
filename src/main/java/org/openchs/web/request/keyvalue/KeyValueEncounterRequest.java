package org.openchs.web.request.keyvalue;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.openchs.web.request.AbstractEncounterRequest;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class KeyValueEncounterRequest extends KeyValueAbstractEncounterRequest {
    private String individualUUID;

    public String getIndividualUUID() {
        return individualUUID;
    }

    public void setIndividualUUID(String individualUUID) {
        this.individualUUID = individualUUID;
    }
}