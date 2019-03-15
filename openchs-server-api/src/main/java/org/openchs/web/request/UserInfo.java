package org.openchs.web.request;

import org.openchs.domain.UserSettingsCollection;

public class UserInfo {

    public UserInfo() {

    }

    private String username;
    private String organisationName;
    private UserSettingsCollection settings;

    public UserInfo(String username, String orgName, UserSettingsCollection settings) {
        this.username = username;
        this.organisationName = orgName;
        this.settings = settings;
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

    public UserSettingsCollection getSettings() {
        return settings;
    }

    public void setSettings(UserSettingsCollection settings) {
        this.settings = settings;
    }
}
