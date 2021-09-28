package org.avni.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserFacilityMappingContract extends CHSRequest {
    private String facilityUUID;

    public String getFacilityUUID() {
        return facilityUUID;
    }

    public void setFacilityUUID(String facilityUUID) {
        this.facilityUUID = facilityUUID;
    }
}
