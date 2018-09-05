package org.openchs.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserContract extends ReferenceDataContract {
    private String organisationUUID;
    private List<UserFacilityMappingContract> userFacilityMappingContracts;
    private String catchmentUUID;

    public String getOrganisationUUID() {
        return organisationUUID;
    }

    public void setOrganisationUUID(String organisationUUID) {
        this.organisationUUID = organisationUUID;
    }

    public List<UserFacilityMappingContract> getUserFacilityMappingContracts() {
        return userFacilityMappingContracts;
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
}