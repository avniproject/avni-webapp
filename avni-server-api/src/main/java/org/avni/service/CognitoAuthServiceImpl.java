package org.avni.service;

import com.auth0.jwt.interfaces.Verification;
import org.avni.config.CognitoConfig;
import org.avni.dao.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CognitoAuthServiceImpl extends BaseIAMService {
    private static final String COGNITO_URL = "https://cognito-idp.ap-south-1.amazonaws.com/";
    private final Logger logger = LoggerFactory.getLogger(CognitoAuthServiceImpl.class);

    private final Boolean isDev;
    private final CognitoConfig cognitoConfig;

    public CognitoAuthServiceImpl(UserRepository userRepository, Boolean isDev, CognitoConfig cognitoConfig) {
        super(userRepository);
        this.isDev = isDev;
        this.cognitoConfig = cognitoConfig;
    }

    public void logConfiguration() {
        logger.debug("Cognito configuration");
        logger.debug(String.format("Pool Id: %s", cognitoConfig.getPoolId()));
        logger.debug(String.format("Client Id: %s", cognitoConfig.getClientId()));
        logger.debug(String.format("Dev mode: %s", isDev));
    }

    protected String getJwkProviderUrl() {
        return this.getIssuer() + "/.well-known/openid-configuration";
    }

    protected String getIssuer() {
        return COGNITO_URL + cognitoConfig.getPoolId();
    }

    protected String getUserUuidField() {
        return "custom:userUUID";
    }

    protected String getUsernameField() {
        return "cognito:username";
    }

    @Override
    protected void addClaim(Verification verification) {
        verification.withClaim("token_use", "id");
    }

    @Override
    protected String getAudience() {
        return cognitoConfig.getClientId();
    }
}
