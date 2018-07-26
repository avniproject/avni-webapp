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
import org.openchs.domain.Organisation;
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
import java.util.Arrays;

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
    private Environment environment;

    @Autowired
    public CognitoUserContextServiceImpl(Environment environment, OrganisationRepository organisationRepository) {
        this.environment = environment;
        this.organisationRepository = organisationRepository;
        logger = LoggerFactory.getLogger(this.getClass());
        this.isDev = isDev();
    }

    public CognitoUserContextServiceImpl(OrganisationRepository organisationRepository, String poolId, String clientId) {
        this.organisationRepository = organisationRepository;
        this.poolId = poolId;
        this.clientId = clientId;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    public void logConfiguration() {
        logger.debug("Cognito configuration");
        logger.debug(String.format("Pool Id: %s", poolId));
        logger.debug(String.format("Client Id: %s", clientId));
        logger.debug(String.format("Default organisation: %s", defaultOrganisation));
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

    protected UserContext getUserContext(String token, boolean verify, String becomeOrganisationName) {
        UserContext userContext = new UserContext();
        if (token == null) return userContext;

        DecodedJWT jwt = verifyAndDecodeToken(token, verify);
        if (jwt == null) return userContext;

        addOrganisationToContext(userContext, jwt, becomeOrganisationName);
        addRolesToContext(userContext, jwt);

        return userContext;
    }

    private void addRolesToContext(UserContext userContext, DecodedJWT jwt) {
        String[][] roles = {{"custom:isAdmin", UserContext.ADMIN},
                {"custom:isOrganisationAdmin", UserContext.ORGANISATION_ADMIN},
                {"custom:isUser", UserContext.USER}};
        Arrays.stream(roles).filter((role) -> hasRole(jwt, role[0])).forEach((role) -> userContext.addRole(role[1]));
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
                    .acceptLeeway(10)
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


    private boolean hasRole(DecodedJWT jwt, String role) {
        Claim claim = jwt.getClaim(role);
        return !claim.isNull() && claim.asString().equalsIgnoreCase("true");
    }

    private void addOrganisationToContext(UserContext userContext, DecodedJWT jwt, String becomeOrganisationName) {
        Organisation becomeOrganisation = getOrganisation(becomeOrganisationName);
        if (becomeOrganisationName != null && becomeOrganisation == null) {
            logger.error(String.format("Organisation '%s' not found", becomeOrganisationName));
            throw new RuntimeException(String.format("Organisation '%s' not found", becomeOrganisationName));
        }
        if (becomeOrganisation != null && hasRole(jwt, "custom:isAdmin")) {
            userContext.setOrganisation(becomeOrganisation);
            return;
        }

        Claim claim = jwt.getClaim("custom:organisationId");
        if (claim.isNull()) {
            logger.error("Organisation claim not found for user " + jwt.getId());
            throw new RuntimeException("Could not find out organisation Id");
        }

        Long organisationId = Long.parseLong(claim.asString());
        if (organisationId != null) {
            userContext.setOrganisation(organisationRepository.findOne(organisationId));
        }
    }

    private Organisation getOrganisation(String becomeOrganisationName) {
        return !StringUtils.isEmpty(becomeOrganisationName) ?
                organisationRepository.findByName(becomeOrganisationName) : null;
    }
}
