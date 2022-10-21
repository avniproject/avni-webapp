package org.avni.server.domain.factory;

import org.avni.server.domain.AddressLevel;
import org.avni.server.domain.AddressLevelType;

public class AddressLevelBuilder {
    private final AddressLevel addressLevel = new AddressLevel();

    public AddressLevel build() {
        return this.addressLevel;
    }

    public AddressLevelBuilder title(String title) {
        addressLevel.setTitle(title);
        return this;
    }

    public AddressLevelBuilder type(AddressLevelType addressLevelType) {
        addressLevel.setType(addressLevelType);
        return this;
    }

    public AddressLevelBuilder id(long id) {
        addressLevel.setId(id);
        return this;
    }
}
