package org.openchs.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.openchs.domain.UserSettingsCollection;

import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserBulkUploadContract extends ReferenceDataContract {
    private String organisationUUID;
    private Long organisationId;
    private List<UserFacilityMappingContract> facilities;
    private String catchmentUUID;
    private long catchmentId;
    private boolean orgAdmin;
    private boolean admin;
    private String operatingIndividualScope;
    private UserSettingsCollection settings;

    public String getOrganisationUUID() {
        return organisationUUID;
    }

    public void setOrganisationUUID(String organisationUUID) {
        this.organisationUUID = organisationUUID;
    }

    public List<UserFacilityMappingContract> getFacilities() {
        return facilities == null ? new ArrayList<>() : facilities;
    }

    public void setFacilities(List<UserFacilityMappingContract> facilities) {
        this.facilities = facilities;
    }

    public String getCatchmentUUID() {
        return catchmentUUID;
    }

    public void setCatchmentUUID(String catchmentUUID) {
        this.catchmentUUID = catchmentUUID;
    }

    public boolean isOrgAdmin() {
        return orgAdmin;
    }

    public void setOrgAdmin(boolean orgAdmin) {
        this.orgAdmin = orgAdmin;
    }

    public boolean isAdmin() {
        return admin;
    }

    public void setAdmin(boolean admin) {
        this.admin = admin;
    }

    public Long getOrganisationId() {
        return organisationId;
    }

    public void setOrganisationId(Long organisationId) {
        this.organisationId = organisationId;
    }

    public long getCatchmentId() {
        return catchmentId;
    }

    public void setCatchmentId(long catchmentId) {
        this.catchmentId = catchmentId;
    }

    public String getOperatingIndividualScope() {
        return operatingIndividualScope;
    }

    public void setOperatingIndividualScope(String operatingIndividualScope) {
        this.operatingIndividualScope = operatingIndividualScope;
    }

    public UserSettingsCollection getSettings() {
        return settings;
    }

    public void setSettings(UserSettingsCollection settings) {
        this.settings = settings;
    }
}
