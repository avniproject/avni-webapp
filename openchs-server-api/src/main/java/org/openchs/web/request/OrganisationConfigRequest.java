package org.openchs.web.request;

import org.openchs.domain.JsonObject;

public class OrganisationConfigRequest {

    private String uuid;
    private JsonObject config;

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public JsonObject getConfig() {
        return config;
    }

    public void setConfig(JsonObject config) {
        this.config = config;
    }
}
