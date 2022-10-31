package org.avni.server.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.avni.server.domain.CHSEntity;
import org.springframework.util.StringUtils;

import java.util.UUID;

// Should be renamed to CHSContract
@JsonInclude(JsonInclude.Include.NON_DEFAULT)
public class CHSRequest {
    private String uuid;
    private Long id;

    @JsonInclude(JsonInclude.Include.NON_DEFAULT)
    private boolean isVoided = false;

    public CHSRequest() {
    }

    public CHSRequest(String uuid) {
        this.uuid = uuid;
    }

    public CHSRequest(String uuid, Long id, boolean isVoided) {
        this.uuid = uuid;
        this.id = id;
        this.isVoided = isVoided;
    }

    public CHSRequest(CHSEntity chsEntity) {
        this(chsEntity.getUuid(), chsEntity.getId(), chsEntity.isVoided());
    }

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getUuid() {
        return uuid == null ? null : uuid.trim();
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
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
