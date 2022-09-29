package org.avni.server.domain;

import java.io.Serializable;

public class RuledEntity implements Serializable {
    private String uuid;
    private RuledEntityType type;

    public RuledEntity() {
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = sanitizeStr(uuid);
    }

    public RuledEntityType getType() {
        return type;
    }

    public void setType(String type) {
        setType(RuledEntityType.parse(sanitizeStr(type)));
    }

    public void setType(RuledEntityType type) {
        this.type = type;
    }

    private String sanitizeStr(Object o) {
        return o == null || o.equals("null") || o.equals("") ? null : o.toString();
    }
}
