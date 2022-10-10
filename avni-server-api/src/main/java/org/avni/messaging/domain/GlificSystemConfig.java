package org.avni.messaging.domain;

import org.avni.server.domain.extenalSystem.ExternalSystemConfig;

public class GlificSystemConfig {

    private static final String BASE_URL = "baseUrl";
    private static final String PHONE = "phone";
    private static final String PASSWORD = "password";
    private ExternalSystemConfig externalSystemConfig;

    public GlificSystemConfig(ExternalSystemConfig externalSystemConfig) {
        this.externalSystemConfig = externalSystemConfig;
    }

    public String getBaseUrl() {
        return get(BASE_URL);
    }

    public String getPhone() {
        return get(PHONE);
    }

    public String getPassword() {
        return get(PASSWORD);
    }

    private String get(String key) {
        return (String) externalSystemConfig.getConfig().get(key);
    }
}
