package org.avni.server.web.response;

import org.avni.server.domain.CHSBaseEntity;

public class AvniEntityResponse {
    private long id;
    private String uuid;

    public AvniEntityResponse(CHSBaseEntity entity) {
        this.id = entity.getId();
        this.uuid = entity.getUuid();
    }

    public AvniEntityResponse() {
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }
}
