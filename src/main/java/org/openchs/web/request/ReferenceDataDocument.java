package org.openchs.web.request;

public class ReferenceDataDocument extends CHSRequest {
    private String name;

    public ReferenceDataDocument() {
    }

    public ReferenceDataDocument(String uuid, String userUUID, String name) {
        super(uuid, userUUID);
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}