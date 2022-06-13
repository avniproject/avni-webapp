package org.avni.service;

import com.auth0.jwt.interfaces.Verification;
import org.avni.dao.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile({"default", "live", "dev", "test"})
@ConditionalOnProperty(prefix = "avni", name = "iam", havingValue = "keycloak")
public class KeycloakAuthService extends BaseIAMService {
    private final Logger logger = LoggerFactory.getLogger(KeycloakAuthService.class);
    private final Boolean isDev;

    @Autowired
    public KeycloakAuthService(UserRepository userRepository, Boolean isDev) {
        super(userRepository);
        this.isDev = isDev;
    }

    @Override
    protected String getUserUuidField() {
        return "preferred_username";
    }

    @Override
    protected String getUsernameField() {
        return null;
    }

    @Override
    protected void addClaim(Verification verification) {
        verification.withClaim("email_verified", true);
    }

    @Override
    protected String getAudience() {
        return "avni-web-app";
    }

    protected String getJwkProviderUrl() {
        return String.format("%s/protocol/openid-connect/certs", getIssuer());
    }

    protected String getIssuer() {
        return "http://localhost:8080/realms/Amrit";
    }

    @Override
    public void logConfiguration() {
        logger.debug("Keycloak configuration");
        logger.debug(String.format("Realm Name: %s", poolId));
        logger.debug(String.format("Client Id: %s", clientId));
        logger.debug(String.format("Dev mode: %s", isDev));
    }
}
