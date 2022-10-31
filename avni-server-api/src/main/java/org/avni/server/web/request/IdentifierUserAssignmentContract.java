package org.avni.server.web.request;

public class IdentifierUserAssignmentContract extends CHSRequest{
    private String identifierSourceUUID;
    private String identifierStart;
    private String identifierEnd;
    private String userUUID;

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

    public String getUserUUID() {
        return userUUID;
    }

    public void setUserUUID(String userUUID) {
        this.userUUID = userUUID;
    }
}
