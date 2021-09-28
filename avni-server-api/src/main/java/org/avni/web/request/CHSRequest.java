package org.avni.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.util.StringUtils;

import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_DEFAULT)
public class CHSRequest {
    private String uuid;
    private String userUUID;
    private Long id;

    @JsonInclude(JsonInclude.Include.NON_DEFAULT)
    private boolean isVoided = false;

    public CHSRequest() {
    }

    public CHSRequest(String uuid, String userUUID) {
        this.uuid = uuid;
        this.userUUID = userUUID;
    }

    public CHSRequest(String uuid) {
        this.uuid = uuid;
    }

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

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
