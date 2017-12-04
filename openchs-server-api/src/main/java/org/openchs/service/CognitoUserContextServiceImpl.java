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
import org.openchs.domain.UserContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.net.MalformedURLException;
import java.net.URL;
import java.security.interfaces.RSAPublicKey;
import java.util.Arrays;

@Service
@Profile({"default", "live"})
public class CognitoUserContextServiceImpl implements UserContextService {

    private final Logger logger;

    @Value("${cognito.publickey}")
    private String publicKey;

    @Value("${cognito.clientid}")
    private String clientId;

    @Autowired
    private OrganisationRepository organisationRepository;

    public CognitoUserContextServiceImpl() {
        logger = LoggerFactory.getLogger(this.getClass());
    }

    public CognitoUserContextServiceImpl(OrganisationRepository organisationRepository, String publicKey, String clientId) {
        this.organisationRepository = organisationRepository;
        this.publicKey = publicKey;
        this.clientId = clientId;

        logger = LoggerFactory.getLogger(this.getClass());
    }

    @Override
    public UserContext getUserContext(String token) {
        return getUserContext(token, true);
    }

    protected UserContext getUserContext(String token, boolean verify) {
        UserContext userContext = new UserContext();
        if (token == null) return userContext;

        DecodedJWT jwt = verifyAndDecodeToken(token, verify);
        if (jwt == null) return userContext;

        addOrganisationToContext(userContext, jwt);
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

            JwkProvider provider = new GuavaCachedJwkProvider(new UrlJwkProvider(new URL(getPublicKeyUrl())));
            Jwk jwk = provider.get(unverifiedJwt.getKeyId());
            RSAPublicKey publicKey = (RSAPublicKey) jwk.getPublicKey();
            Algorithm algorithm = Algorithm.RSA256(publicKey, null);
            JWTVerifier verifier = JWT.require(algorithm)
                    .withIssuer(this.publicKey)
                    .withClaim("token_use", "id")
                    .withAudience(clientId)
                    .build();

            logger.debug(String.format("Verifying token for issuer: %s, token_use: id and audience: %s", this.publicKey, clientId));
            return verifier.verify(token);

        } catch (MalformedURLException | InvalidPublicKeyException e) {
            logger.error("Check the settings for public key " + getPublicKeyUrl(), e);
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

    private String getPublicKeyUrl() {
        return this.publicKey + "/.well-known/jwks.json";
    }

    private boolean hasRole(DecodedJWT jwt, String role) {
        Claim claim = jwt.getClaim(role);
        return !claim.isNull() && claim.asString().equalsIgnoreCase("true");
    }

    private void addOrganisationToContext(UserContext userContext, DecodedJWT jwt) {
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
}
