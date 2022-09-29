package org.avni.server.domain;

public class SyncableItem {
    private String name;
    private String entityTypeUuid;

    public SyncableItem(String name, String entityTypeUuid) {
        this.name = name;
        this.entityTypeUuid = entityTypeUuid;
    }

    public String getName() {
        return name;
    }

    public String getEntityTypeUuid() {
        return entityTypeUuid;
    }
}
