package org.openchs.web.request;

import java.util.List;

public class CatchmentContract extends ReferenceDataContract {
    private String type;

    private List<AddressLevelContract> addressLevels;

    public List<AddressLevelContract> getAddressLevels() {
        return addressLevels;
    }

    public void setAddressLevels(List<AddressLevelContract> addressLevels) {
        this.addressLevels = addressLevels;
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
