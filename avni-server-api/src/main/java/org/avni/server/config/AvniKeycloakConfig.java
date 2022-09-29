package org.avni.server.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AvniKeycloakConfig {

    @Value("${avni.keycloak.verify.token.audience}")
    private String verifyTokenAudience;

    @Value("${avni.keycloak.user.email.verified}")
    private String userEmailVerified;

    @Value("${avni.keycloak.user.preferred.username}")
    private String prefferedUserName;

    @Value("${avni.keycloak.user.uuid}")
    private String customUserUUID;

    @Value("${avni.keycloak.openid.connect.certs}")
    private String openidConnectCertsUrlFormat;

    @Value("${avni.keycloak.realms}")
    private String realmsUrlFormat;

    public String getVerifyTokenAudience() {
        return verifyTokenAudience;
    }

    public String getUserEmailVerified() {
        return userEmailVerified;
    }

    public String getPrefferedUserName() {
        return prefferedUserName;
    }

    public String getCustomUserUUID() {
        return customUserUUID;
    }

    public String getOpenidConnectCertsUrlFormat() {
        return openidConnectCertsUrlFormat;
    }

    public String getRealmsUrlFormat() {
        return realmsUrlFormat;
    }
}
