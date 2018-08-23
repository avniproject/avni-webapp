package org.openchs.web.request;

import java.util.List;

public class LocationsContract {
    private String organisation;
    private List<LocationContract> locations;

    public String getOrganisation() {
        return organisation;
    }

    public void setOrganisation(String organisation) {
        this.organisation = organisation;
    }
    public List<LocationContract> getLocations() {
        return locations;
    }

    public void setLocations(List<LocationContract> locations) {
        this.locations = locations;
    }

}
