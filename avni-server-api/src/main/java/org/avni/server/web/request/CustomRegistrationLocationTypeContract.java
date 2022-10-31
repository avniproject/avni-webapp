package org.avni.server.web.request;

import java.util.List;

public class CustomRegistrationLocationTypeContract {
    private String subjectTypeUUID;
    private List<AddressLevelTypeContract> addressLevels;

    public String getSubjectTypeUUID() {
        return subjectTypeUUID;
    }

    public void setSubjectTypeUUID(String subjectTypeUUID) {
        this.subjectTypeUUID = subjectTypeUUID;
    }

    public List<AddressLevelTypeContract> getAddressLevels() {
        return addressLevels;
    }

    public void setAddressLevels(List<AddressLevelTypeContract> addressLevels) {
        this.addressLevels = addressLevels;
    }
}
