package org.openchs.web.request;

public class EncounterRequest extends AbstractEncounterRequest {
    private String individualUUID;

    public String getIndividualUUID() {
        return individualUUID;
    }

    public void setIndividualUUID(String individualUUID) {
        this.individualUUID = individualUUID;
    }

}