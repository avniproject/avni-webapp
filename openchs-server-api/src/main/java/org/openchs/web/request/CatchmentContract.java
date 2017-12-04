package org.openchs.web.request;

import java.util.List;

public class CatchmentContract extends ReferenceDataContract {

    private List<AddressLevelContract> addressLevels;

    public List<AddressLevelContract> getAddressLevels() {
        return addressLevels;
    }

    public void setAddressLevels(List<AddressLevelContract> addressLevels) {
        this.addressLevels = addressLevels;
    }

    @Override
    public String toString() {
        return String.format("UUID: %s, Name: %s", this.getUuid(), this.getName());
    }
}
