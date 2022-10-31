package org.avni.server.domain;

import org.avni.server.web.validation.ValidationException;
import org.junit.Assert;
import org.junit.Test;

public class UserTest {
    @Test
    public void validUserName() {
        User.validateUsername("test@example", "example");
    }
    
    @Test
    public void invalidUserName() {
        try {
            User.validateUsername("tes@example", "example");
            Assert.fail("at least four chars in name");
        } catch (ValidationException ignored) {
        }
    }
}
