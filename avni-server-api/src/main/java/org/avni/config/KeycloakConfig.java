package org.avni.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class KeycloakConfig {
    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.server}")
    private String server;

    @Value("${keycloak.avni-server.audience}")
    private String audience;

    public String getRealm() {
        return realm;
    }

    public String getServer() {
        return server;
    }

    public String getAudience() {
        return audience;
    }
}
