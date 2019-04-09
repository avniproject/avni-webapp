package org.openchs.web.request;

public class IdentifierUserAssignmentContract extends CHSRequest{
    private String identifierSourceUUID;
    private String identifierStart;
    private String identifierEnd;

    public String getIdentifierSourceUUID() {
        return identifierSourceUUID;
    }

    public void setIdentifierSourceUUID(String identifierSourceUUID) {
        this.identifierSourceUUID = identifierSourceUUID;
    }

    public String getIdentifierStart() {
        return identifierStart;
    }

    public void setIdentifierStart(String identifierStart) {
        this.identifierStart = identifierStart;
    }

    public String getIdentifierEnd() {
        return identifierEnd;
    }

    public void setIdentifierEnd(String identifierEnd) {
        this.identifierEnd = identifierEnd;
    }
}
