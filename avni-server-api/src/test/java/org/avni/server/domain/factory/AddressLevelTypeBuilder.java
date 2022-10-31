package org.avni.server.domain.factory;

import org.avni.server.domain.AddressLevelType;

public class AddressLevelTypeBuilder {
    private final AddressLevelType addressLevelType = new AddressLevelType();

    public AddressLevelTypeBuilder name(String name) {
        addressLevelType.setName(name);
        return this;
    }

    public AddressLevelTypeBuilder level(Double level) {
        addressLevelType.setLevel(level);
        return this;
    }

    public AddressLevelType build() {
        return this.addressLevelType;
    }
}
