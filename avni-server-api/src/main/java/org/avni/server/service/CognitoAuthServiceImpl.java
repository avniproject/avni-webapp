package org.avni.server.service;

import com.auth0.jwt.interfaces.Verification;
import org.avni.server.config.CognitoConfig;
import org.avni.server.dao.UserRepository;
import org.avni.server.framework.context.SpringProfiles;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

//Not defined as bean because it is dynamically loaded based on the spring profile
public class CognitoAuthServiceImpl extends BaseIAMService {
    private static final String COGNITO_URL = "https://cognito-idp.ap-south-1.amazonaws.com/";
    private final Logger logger = LoggerFactory.getLogger(CognitoAuthServiceImpl.class);

    private final CognitoConfig cognitoConfig;

    public CognitoAuthServiceImpl(UserRepository userRepository, CognitoConfig cognitoConfig, SpringProfiles springProfiles, BaseIAMService alternateIAMService) {
        super(userRepository, springProfiles, alternateIAMService);
        this.cognitoConfig = cognitoConfig;
    }

    public void logConfiguration() {
        logger.debug("Cognito configuration");
        logger.debug(String.format("Pool Id: %s", cognitoConfig.getPoolId()));
        logger.debug(String.format("Client Id: %s", cognitoConfig.getClientId()));
        logger.debug(String.format("Spring Profile: %s", springProfiles.getProfiles()));
    }

    protected String getJwkProviderUrl() {
        return this.getIssuer() + "/.well-known/jwks.json";
    }

    protected String getIssuer() {
        return COGNITO_URL + cognitoConfig.getPoolId();
    }

    @Override
    protected String getUserUuidField() {
        return "custom:userUUID";
    }

    @Override
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
