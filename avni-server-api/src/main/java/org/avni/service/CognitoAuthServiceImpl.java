package org.avni.service;

import com.auth0.jwk.*;
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTDecodeException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.google.common.base.Strings;
import org.avni.dao.UserRepository;
import org.avni.domain.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.net.MalformedURLException;
import java.net.URL;
import java.security.interfaces.RSAPublicKey;

@Service
@Profile({"default", "live", "dev", "test"})
public class CognitoAuthServiceImpl implements CognitoAuthService {

//    private static final String COGNITO_URL = "https://cognito-idp.ap-south-1.amazonaws.com/";
    private static final String COGNITO_URL = "http://localhost:8080/realms/Amrit/";
    private final Logger logger;

    @Value("${cognito.poolid}")
    private String poolId;

    @Value("${cognito.clientid}")
    private String clientId;

    private UserRepository userRepository;
    private Boolean isDev;

    @Autowired
    public CognitoAuthServiceImpl(UserRepository userRepository, Boolean isDev) {
        this.userRepository = userRepository;
        this.isDev = isDev;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    public CognitoAuthServiceImpl(UserRepository userRepository, String poolId, String clientId) {
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

    @Override
    public User getUserFromToken(String token) {
        logConfiguration();
        if (StringUtils.isEmpty(token)) return null;

        DecodedJWT jwt = verifyAndDecodeToken(token, true);
        if (jwt == null) return null;

        String username = getValueInToken(jwt, "cognito:username");
        String userUUID = getValueInToken(jwt, "custom:userUUID");
        return Strings.isNullOrEmpty(userUUID)
                ? userRepository.findByUsername(username)
                : userRepository.findByUuid(userUUID);
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
        } catch (JWTDecodeException e) {
            logger.error("Could not decode token " + token, e);
            throw new RuntimeException(e);
        } catch (JWTVerificationException e) {
            logger.error("Could not verify token " + token, e);
            throw new RuntimeException(e);
        } catch (JwkException e) {
            logger.error("Could not get public key for key specified in jwt token " + token, e);
            throw new RuntimeException(e);
        }
    }

    private String getJwkProviderUrl() {
        return this.getIssuer() + ".well-known/openid-configuration";
    }

    private String getIssuer() {
        return COGNITO_URL;
//        return COGNITO_URL + this.poolId;
    }

    private String getValueInToken(DecodedJWT jwt, String name) {
        Claim claim = jwt.getClaim(name);
        if (claim.isNull()) return null;
        return claim.asString();
    }
}
