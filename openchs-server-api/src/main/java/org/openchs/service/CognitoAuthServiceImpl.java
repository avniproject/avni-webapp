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

@Service
@Profile({"default", "live"})
public class CognitoAuthServiceImpl implements AuthService {

    private final Logger logger;

    @Value("${cognito.publickey}")
    private String publicKey;

    @Value("${cognito.clientid}")
    private String clientId;

    private OrganisationRepository organisationRepository;

    @Autowired
    public CognitoAuthServiceImpl(OrganisationRepository organisationRepository) {
        this.organisationRepository = organisationRepository;

        logger = LoggerFactory.getLogger(this.getClass());
    }

    @Override
    public UserContext validate(String token) {
        UserContext userContext = new UserContext();

        Long organisationId = findOrganisation(token);
        if (organisationId != null) {
            userContext.setOrganisation(organisationRepository.findOne(organisationId));
        }
        userContext.addUserRole();
        return userContext;
    }

    private String getPublicKeyUrl() {
        return this.publicKey + "/.well-known/jwks.json";
    }

    private Long findOrganisation(String token) {
        try {
            DecodedJWT unverifiedJwt = JWT.decode(token);

            JwkProvider provider = new GuavaCachedJwkProvider(new UrlJwkProvider(new URL(getPublicKeyUrl())));
            Jwk jwk = provider.get(unverifiedJwt.getKeyId());
            RSAPublicKey publicKey = (RSAPublicKey) jwk.getPublicKey();
            Algorithm algorithmRS = Algorithm.RSA256(publicKey, null);
            JWTVerifier verifier = JWT.require(algorithmRS)
                    .withIssuer(this.publicKey)
                    .withClaim("token_use", "id")
                    .withAudience(clientId)
                    .build();

            DecodedJWT jwt = verifier.verify(token);
            Claim claim = jwt.getClaim("custom:organisationId");
            if (claim.isNull()) {
                logger.error("Organisation claim not found for user " + jwt.getId());
                throw new RuntimeException("Could not find out organisation Id");
            }

            return Long.parseLong(claim.asString());

        } catch (MalformedURLException|InvalidPublicKeyException e) {
            logger.error("Check the settings for public key " + getPublicKeyUrl(), e);
            throw new RuntimeException(e);
        } catch (JWTDecodeException decodeException) {
            logger.debug("Could not decode token " + token, decodeException);
            return null;
        } catch (JWTVerificationException e) {
            logger.error("Could not verify token " + token, e);
            return null;
        } catch (JwkException e) {
            logger.error("Probably incorrect url. Could not get public key for key specified in jwt token " + token, e);
            throw new RuntimeException(e);
        }
    }
}
