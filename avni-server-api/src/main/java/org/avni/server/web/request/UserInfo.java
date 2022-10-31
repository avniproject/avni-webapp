package org.avni.server.web.request;

import org.joda.time.DateTime;
import org.avni.server.domain.JsonObject;
import org.springframework.hateoas.core.Relation;

@Relation(collectionRelation = "userInfo")
public class UserInfo {

    public UserInfo() { }

    private String username;
    private String organisationName;
    private Long organisationId;
    private String usernameSuffix;

    private JsonObject settings;
    private DateTime lastModifiedDateTime;
    private String[] roles;
    private String name;
    private String catchmentName;
    private JsonObject syncSettings;

    public UserInfo(String username, String orgName, Long orgId, String usernameSuffix, String[] roles, JsonObject settings, String name, String catchmentName, JsonObject syncSettings) {
        this.username = username;
        this.organisationName = orgName;
        this.organisationId = orgId;
        this.roles = roles;
        this.settings = settings;
        this.lastModifiedDateTime = DateTime.now();
        this.usernameSuffix = usernameSuffix;
        this.name = name;
        this.catchmentName = catchmentName;
        this.syncSettings = syncSettings;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getOrganisationName() {
        return organisationName;
    }

    public void setOrganisationName(String organisationName) {
        this.organisationName = organisationName;
    }

    public Long getOrganisationId() { return organisationId; }

    public void setOrganisationId(Long organisationId) { this.organisationId = organisationId; }

    public String[] getRoles() { return roles; }

    public void setRoles(String[] roles) { this.roles = roles; }

    public JsonObject getSettings() {
        return settings;
    }

    public void setSettings(JsonObject settings) {
        this.settings = settings;
    }

    public DateTime getLastModifiedDateTime() {
        return lastModifiedDateTime;
    }

    public void setLastModifiedDateTime(DateTime lastModifiedDateTime) {
        this.lastModifiedDateTime = lastModifiedDateTime;
    }

    public String getUsernameSuffix() {
        return usernameSuffix;
    }

    public void setUsernameSuffix(String usernameSuffix) {
        this.usernameSuffix = usernameSuffix;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCatchmentName() {
        return catchmentName;
    }

    public void setCatchmentName(String catchmentName) {
        this.catchmentName = catchmentName;
    }

    public JsonObject getSyncSettings() {
        return syncSettings;
    }

    public void setSyncSettings(JsonObject syncSettings) {
        this.syncSettings = syncSettings;
    }
}
