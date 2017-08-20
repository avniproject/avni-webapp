package org.openchs.web.request;

public class CHSRequest {
    private String uuid;
    private String userUUID;

    public CHSRequest() {
    }

    public CHSRequest(String uuid, String userUUID) {
        this.uuid = uuid;
        this.userUUID = userUUID;
    }

    public String getUuid() {
        return uuid == null ? null : uuid.trim();
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getUserUUID() {
        return userUUID;
    }

    public void setUserUUID(String userUUID) {
        this.userUUID = userUUID;
    }
}