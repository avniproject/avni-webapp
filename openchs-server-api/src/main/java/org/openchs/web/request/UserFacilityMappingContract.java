package org.openchs.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserFacilityMappingContract extends CHSRequest {
    private String facilityUUID;
    private String userUUID;

    public String getFacilityUUID() {
        return facilityUUID;
    }

    public void setFacilityUUID(String facilityUUID) {
        this.facilityUUID = facilityUUID;
    }

    @Override
    public String getUserUUID() {
        return userUUID;
    }

    @Override
    public void setUserUUID(String userUUID) {
        this.userUUID = userUUID;
    }
}