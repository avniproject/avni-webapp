package org.openchs.web.request;

import org.springframework.util.StringUtils;

import java.util.UUID;

public class CHSRequest {
    private String uuid;
    private String userUUID;
    private boolean isVoided;

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

    public void setupUuidIfNeeded() {
        if (StringUtils.isEmpty(uuid)) {
            setUuid(UUID.randomUUID().toString());
        }
    }

    public boolean isVoided() {
        return isVoided;
    }

    public void setVoided(boolean voided) {
        isVoided = voided;
    }
}