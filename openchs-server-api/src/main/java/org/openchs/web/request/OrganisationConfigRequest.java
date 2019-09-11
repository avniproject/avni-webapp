package org.openchs.web.request;

import org.openchs.domain.JsonObject;

public class OrganisationConfigRequest {

    private String uuid;
    private JsonObject settings;

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public JsonObject getSettings() {
        return settings;
    }

    public void setSettings(JsonObject settings) {
        this.settings = settings;
    }
}
