package org.openchs.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.joda.time.LocalDate;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class FacilityContract extends ReferenceDataContract {

    private String locationUUID;

    public String getLocationUUID() {
        return locationUUID;
    }

    public void setLocationUUID(String locationUUID) {
        this.locationUUID = locationUUID;
    }
}