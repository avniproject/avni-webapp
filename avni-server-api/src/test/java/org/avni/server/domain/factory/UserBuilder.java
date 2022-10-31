package org.avni.server.domain.factory;

import org.avni.server.domain.User;

public class UserBuilder {
    private final User user = new User();

    public UserBuilder userName(String name) {
        user.setUsername(name);
        return this;
    }

    public UserBuilder phoneNumber(String phoneNumber) {
        user.setPhoneNumber(phoneNumber);
        return this;
    }

    public User build() {
        return user;
    }
}
