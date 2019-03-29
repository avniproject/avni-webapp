package org.openchs.web.request;

import org.joda.time.DateTime;
import org.openchs.domain.JsonObject;

public class SyncTelemetryRequest {
    private String uuid;
    private Long organisationId;
    private String syncStatus;
    private JsonObject entityStatus;
    private DateTime syncStartTime;
    private DateTime syncEndTime;

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public Long getOrganisationId() {
        return organisationId;
    }

    public void setOrganisationId(Long organisationId) {
        this.organisationId = organisationId;
    }

    public String getSyncStatus() {
        return syncStatus;
    }

    public void setSyncStatus(String syncStatus) {
        this.syncStatus = syncStatus;
    }

    public JsonObject getEntityStatus() {
        return entityStatus;
    }

    public void setEntityStatus(JsonObject entityStatus) {
        this.entityStatus = entityStatus;
    }

    public DateTime getSyncStartTime() {
        return syncStartTime;
    }

    public void setSyncStartTime(DateTime syncStartTime) {
        this.syncStartTime = syncStartTime;
    }

    public DateTime getSyncEndTime() {
        return syncEndTime;
    }

    public void setSyncEndTime(DateTime syncEndTime) {
        this.syncEndTime = syncEndTime;
    }
}
