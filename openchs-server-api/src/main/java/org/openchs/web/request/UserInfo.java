package org.openchs.web.request;

import org.joda.time.DateTime;
import org.openchs.domain.JsonObject;
import org.springframework.hateoas.core.Relation;

@Relation(collectionRelation = "userInfo")
public class UserInfo {

    public UserInfo() { }

    private String username;
    private String organisationName;
    private Long organisationId;

    private JsonObject settings;
    private DateTime lastModifiedDateTime;
    private String[] roles;

    public UserInfo(String username, String orgName, Long orgId, String[] roles, JsonObject settings) {
        this.username = username;
        this.organisationName = orgName;
        this.organisationId = orgId;
        this.roles = roles;
        this.settings = settings;
        this.lastModifiedDateTime = DateTime.now();
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
}
