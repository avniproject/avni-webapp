package org.openchs.service;

import com.auth0.jwk.*;
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTDecodeException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.openchs.dao.OrganisationRepository;
import org.openchs.dao.UserRepository;
import org.openchs.domain.Organisation;
import org.openchs.domain.User;
import org.openchs.domain.UserContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.net.MalformedURLException;
import java.net.URL;
import java.security.interfaces.RSAPublicKey;

@Service
@Profile({"default", "live", "dev", "test"})
public class CognitoUserContextServiceImpl implements UserContextService {

    private static final String COGNITO_URL = "https://cognito-idp.ap-south-1.amazonaws.com/";
    private final Logger logger;
    private boolean isDev;

    @Value("${cognito.poolid}")
    private String poolId;

    @Value("${cognito.clientid}")
    private String clientId;

    @Value("${openchs.defaultOrgName}")
    private String defaultOrganisation;

    private OrganisationRepository organisationRepository;
    private UserRepository userRepository;
    private Environment environment;

    @Autowired
    public CognitoUserContextServiceImpl(Environment environment, OrganisationRepository organisationRepository, UserRepository userRepository) {
        this.environment = environment;
        this.organisationRepository = organisationRepository;
        this.userRepository = userRepository;
        logger = LoggerFactory.getLogger(this.getClass());
        this.isDev = isDev();
    }

    public CognitoUserContextServiceImpl(OrganisationRepository organisationRepository, UserRepository userRepository, String poolId, String clientId) {
        this.organisationRepository = organisationRepository;
        this.userRepository = userRepository;
        this.poolId = poolId;
        this.clientId = clientId;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    public void logConfiguration() {
        logger.debug("Cognito configuration");
        logger.debug(String.format("Pool Id: %s", poolId));
        logger.debug(String.format("Client Id: %s", clientId));
        logger.debug(String.format("Dev mode: %s", isDev));
    }

    private boolean isDev() {
        String[] activeProfiles = environment.getActiveProfiles();
        return activeProfiles.length == 1 && (activeProfiles[0].equals("dev") || activeProfiles[0].equals("test"));
    }

    @Override
    public UserContext getUserContext(String token, String becomeOrganisationName) {
        logConfiguration();
        if (isDev) {
            UserContext userContext = new UserContext();
            String organisationName = StringUtils.isEmpty(becomeOrganisationName) ? defaultOrganisation : becomeOrganisationName.trim();
            userContext.setOrganisation(organisationRepository.findByName(organisationName));
            userContext.addUserRole().addAdminRole().addOrganisationAdminRole();
            return userContext;
        } else {
            return getUserContext(token, true, becomeOrganisationName);
        }
    }

    @Override
    public void setUserForInDevMode(UserContext userContext) {
        if (isDev) {
            userContext.setUser(userRepository.findByName("admin"));
        }
    }

    protected UserContext getUserContext(String token, boolean verify, String becomeOrganisationName) {
        UserContext userContext = new UserContext();
        if (token == null) return userContext;

        DecodedJWT jwt = verifyAndDecodeToken(token, verify);
        if (jwt == null) return userContext;


        String userUUID = getValueInToken(jwt, "custom:userUUID");
        User user = userRepository.findByUuid(userUUID);
        userContext.setUser(user);
        addOrganisationToContext(userContext, becomeOrganisationName);

        return userContext;
    }

    private DecodedJWT verifyAndDecodeToken(String token, boolean verify) {
        try {
            DecodedJWT unverifiedJwt = JWT.decode(token);
            if (!verify) return unverifiedJwt;

            JwkProvider provider = new GuavaCachedJwkProvider(new UrlJwkProvider(new URL(getJwkProviderUrl())));
            Jwk jwk = provider.get(unverifiedJwt.getKeyId());
            RSAPublicKey publicKey = (RSAPublicKey) jwk.getPublicKey();
            Algorithm algorithm = Algorithm.RSA256(publicKey, null);
            JWTVerifier verifier = JWT.require(algorithm)
                    .withIssuer(getIssuer())
                    .withClaim("token_use", "id")
                    .withAudience(clientId)
                    .acceptLeeway(240)
                    .build();

            logger.debug(String.format("Verifying token for issuer: %s, token_use: id and audience: %s", this.getIssuer(), clientId));
            return verifier.verify(token);

        } catch (MalformedURLException | InvalidPublicKeyException e) {
            logger.error("Check the settings for public key " + getIssuer(), e);
            throw new RuntimeException(e);
        } catch (JWTDecodeException decodeException) {
            logger.debug("Could not decode token " + token, decodeException);
            return null;
        } catch (JWTVerificationException e) {
            logger.error("Could not verify token " + token, e);
            return null;
        } catch (JwkException e) {
            logger.error("Could not get public key for key specified in jwt token " + token, e);
            throw new RuntimeException(e);
        }
    }

    private String getJwkProviderUrl() {
        return this.getIssuer() + "/.well-known/jwks.json";
    }

    private String getIssuer() {
        return COGNITO_URL + this.poolId;
    }

    private void addOrganisationToContext(UserContext userContext, String becomeOrganisationName) {
        Organisation becomeOrganisation = getOrganisation(becomeOrganisationName);
        if (becomeOrganisationName != null && becomeOrganisation == null) {
            logger.error(String.format("Organisation '%s' not found", becomeOrganisationName));
            throw new RuntimeException(String.format("Organisation '%s' not found", becomeOrganisationName));
        }
        if (becomeOrganisation != null && userContext.getUser().isAdmin()) {
            userContext.setOrganisation(becomeOrganisation);
            return;
        }
        userContext.setOrganisation(organisationRepository.findOne(userContext.getUser().getOrganisationId()));
    }

    private String getValueInToken(DecodedJWT jwt, String name) {
        Claim claim = jwt.getClaim(name);
        if (claim.isNull()) return null;
        return claim.asString();
    }

    private Organisation getOrganisation(String becomeOrganisationName) {
        return !StringUtils.isEmpty(becomeOrganisationName) ?
                organisationRepository.findByName(becomeOrganisationName) : null;
    }
}
