package org.avni.messaging.contract.glific;

import org.avni.messaging.domain.GlificSystemConfig;
import org.springframework.util.Assert;

import java.io.Serializable;

public class GlificUser implements Serializable {
    private final String phone;
    private final String password;

    public GlificUser(GlificSystemConfig systemConfig) {
        Assert.hasText(systemConfig.getPhone(), "Config phone is mandatory in external_system_config");
        Assert.hasText(systemConfig.getPassword(), "Config password is mandatory in external_system_config");

        this.phone = systemConfig.getPhone();
        this.password = systemConfig.getPassword();
    }

    public String getPhone() {
        return phone;
    }

    public String getPassword() {
        return password;
    }
}
