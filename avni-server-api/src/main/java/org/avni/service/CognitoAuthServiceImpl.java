package org.avni.service;

import com.auth0.jwt.interfaces.Verification;
import org.avni.dao.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile({"default", "live", "dev", "test"})
@ConditionalOnProperty(prefix = "avni", name = "iam", havingValue = "cognito")
public class CognitoAuthServiceImpl extends BaseIAMService {
    private static final String COGNITO_URL = "https://cognito-idp.ap-south-1.amazonaws.com/";
    private final Logger logger = LoggerFactory.getLogger(CognitoAuthServiceImpl.class);

    @Value("${cognito.poolid}")
    private String poolId;

    @Value("${cognito.clientid}")
    private String clientId;

    private final Boolean isDev;

    @Autowired
    public CognitoAuthServiceImpl(UserRepository userRepository, Boolean isDev) {
        super(userRepository);
        this.isDev = isDev;
    }

    public void logConfiguration() {
        logger.debug("Cognito configuration");
        logger.debug(String.format("Pool Id: %s", poolId));
        logger.debug(String.format("Client Id: %s", clientId));
        logger.debug(String.format("Dev mode: %s", isDev));
    }

    protected String getJwkProviderUrl() {
        return this.getIssuer() + ".well-known/openid-configuration";
    }

    protected String getIssuer() {
        return COGNITO_URL + this.poolId;
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
        return clientId;
    }
}
