package org.openchs.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class EncounterRequest extends AbstractEncounterRequest {
    private String individualUUID;
    private PointRequest encounterLocation;

    public String getIndividualUUID() {
        return individualUUID;
    }

    public void setIndividualUUID(String individualUUID) {
        this.individualUUID = individualUUID;
    }

    public PointRequest getEncounterLocation() {
        return encounterLocation;
    }

    public void setEncounterLocation(PointRequest encounterLocation) {
        this.encounterLocation = encounterLocation;
    }
}