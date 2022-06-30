package org.avni.service;

import com.auth0.jwt.interfaces.Verification;
import org.avni.dao.UserRepository;
import org.avni.framework.context.SpringProfiles;
import org.keycloak.representations.adapters.config.AdapterConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class KeycloakAuthService extends BaseIAMService {
    private final Logger logger = LoggerFactory.getLogger(KeycloakAuthService.class);
    private final AdapterConfig adapterConfig;

    public KeycloakAuthService(UserRepository userRepository, AdapterConfig adapterConfig, SpringProfiles springProfiles) {
        super(userRepository, springProfiles, null);
        this.adapterConfig = adapterConfig;
    }

    @Override
    public void logConfiguration() {
        logger.debug("Keycloak configuration");
        logger.debug(String.format("Keycloak server: %s", adapterConfig.getAuthServerUrl()));
        logger.debug(String.format("Realm name: %s", adapterConfig.getRealm()));
        logger.debug(String.format("Audience name: %s", adapterConfig.getResource()));
        logger.debug(String.format("Spring profile: %s", springProfiles.getProfiles()));
    }

    protected String getJwkProviderUrl() {
        return String.format("%s/protocol/openid-connect/certs", getIssuer());
    }

    protected String getIssuer() {
        return String.format("%s/realms/%s", adapterConfig.getAuthServerUrl(), adapterConfig.getRealm());
    }
    @Override
    protected String getUserUuidField() {
        return "custom:userUUID";
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
        return adapterConfig.getResource();
    }
}
