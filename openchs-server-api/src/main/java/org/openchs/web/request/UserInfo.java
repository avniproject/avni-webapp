package org.openchs.web.request;

public class UserInfo {
    private String catchmentType;
    private String organisationName;

    public UserInfo(String catchmentType, String orgName) {
        this.catchmentType = catchmentType;
        this.organisationName = orgName;
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
}
