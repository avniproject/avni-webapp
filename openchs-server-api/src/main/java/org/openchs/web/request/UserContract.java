package org.openchs.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserContract extends ReferenceDataContract {
    private String organisationUUID;
    private long organisationId;
    private List<UserFacilityMappingContract> userFacilityMappingContracts;
    private String catchmentUUID;
    private long catchmentId;
    private boolean orgAdmin;
    private boolean admin;

    public String getOrganisationUUID() {
        return organisationUUID;
    }

    public void setOrganisationUUID(String organisationUUID) {
        this.organisationUUID = organisationUUID;
    }

    public List<UserFacilityMappingContract> getUserFacilityMappingContracts() {
        return userFacilityMappingContracts == null ? new ArrayList<>() : userFacilityMappingContracts;
    }

    public void setUserFacilityMappingContracts(List<UserFacilityMappingContract> userFacilityMappingContracts) {
        this.userFacilityMappingContracts = userFacilityMappingContracts;
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

    public long getOrganisationId() {
        return organisationId;
    }

    public void setOrganisationId(long organisationId) {
        this.organisationId = organisationId;
    }

    public long getCatchmentId() {
        return catchmentId;
    }

    public void setCatchmentId(long catchmentId) {
        this.catchmentId = catchmentId;
    }
}