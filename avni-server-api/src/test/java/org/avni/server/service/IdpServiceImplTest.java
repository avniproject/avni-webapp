package org.avni.server.service;

import org.avni.server.domain.User;
import org.avni.server.domain.factory.UserBuilder;
import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class IdpServiceImplTest {
    @Test
    public void getDefaultPassword() {
        User user = new UserBuilder().userName("example@foo").phoneNumber("9090909090").build();
        assertEquals("exam9090", IdpServiceImpl.getDefaultPassword(user));
    }
}
