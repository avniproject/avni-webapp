package org.openchs.web.request;

import org.openchs.domain.UserSettingsCollection;

public class UserInfo {

    public UserInfo() {

    }

    @Deprecated
    private String catchmentType;
    private String organisationName;
    private UserSettingsCollection settings;

    public UserInfo(String catchmentType, String orgName, UserSettingsCollection settings) {
        this.catchmentType = catchmentType;
        this.organisationName = orgName;
        this.settings = settings;
    }

    public String getCatchmentType() {
        return catchmentType;
    }

    public void setCatchmentType(String catchmentType) {
        this.catchmentType = catchmentType;
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
