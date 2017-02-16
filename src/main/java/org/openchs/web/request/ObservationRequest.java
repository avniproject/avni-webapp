package org.openchs.web.request;

public class ObservationRequest {
    private String conceptUUID;
    private String value;

    public String getConceptUUID() {
        return conceptUUID;
    }

    public void setConceptUUID(String conceptUUID) {
        this.conceptUUID = conceptUUID;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}