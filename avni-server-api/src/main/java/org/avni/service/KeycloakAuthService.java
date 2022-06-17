package org.avni.service;

import com.auth0.jwt.interfaces.Verification;
import org.avni.config.KeycloakConfig;
import org.avni.dao.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

public class KeycloakAuthService extends BaseIAMService {
    private final Logger logger = LoggerFactory.getLogger(KeycloakAuthService.class);
    private final KeycloakConfig keycloakConfig;
    private final Boolean isDev;

    public KeycloakAuthService(UserRepository userRepository, KeycloakConfig keycloakConfig, Boolean isDev) {
        super(userRepository);
        this.keycloakConfig = keycloakConfig;
        this.isDev = isDev;
    }

    @Override
    protected String getUserUuidField() {
        return null;
    }

    @Override
    protected String getUsernameField() {
        return "preferred_username";
    }

    @Override
    protected void addClaim(Verification verification) {
        verification.withClaim("email_verified", true);
    }

    @Override
    protected String getAudience() {
        return keycloakConfig.getAudience();
    }

    protected String getJwkProviderUrl() {
        return String.format("%s/protocol/openid-connect/certs", getIssuer());
    }

    protected String getIssuer() {
        return String.format("%s/realms/%s", keycloakConfig.getServer(), keycloakConfig.getRealm());
    }

    @Override
    public void logConfiguration() {
        logger.debug("Keycloak configuration");
        logger.debug(String.format("Keycloak server: %s", keycloakConfig.getServer()));
        logger.debug(String.format("Realm name: %s", keycloakConfig.getRealm()));
        logger.debug(String.format("Audience name: %s", keycloakConfig.getAudience()));
        logger.debug(String.format("Dev mode: %s", isDev));
    }
}
