package org.openchs.web.request;

import org.openchs.domain.JsonObject;
import org.openchs.domain.OrganisationConfig;

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

    public static OrganisationConfigRequest fromOrganisationConfig(OrganisationConfig organisationConfig) {
        OrganisationConfigRequest configRequest = new OrganisationConfigRequest();
        configRequest.setUuid(organisationConfig.getUuid());
        configRequest.setSettings(organisationConfig.getSettings());
        return configRequest;
    }
}
