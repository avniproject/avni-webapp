package org.openchs.web.request;

import java.util.ArrayList;
import java.util.List;

public class CatchmentContract extends ReferenceDataContract {
    private String type;

    private List<AddressLevelContract> locations = new ArrayList<>();

    public List<AddressLevelContract> getLocations() {
        return locations;
    }

    public void setLocations(List<AddressLevelContract> locations) {
        this.locations = locations;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    @Override
    public String toString() {
        return String.format("UUID: %s, Name: %s", this.getUuid(), this.getName());
    }
}
