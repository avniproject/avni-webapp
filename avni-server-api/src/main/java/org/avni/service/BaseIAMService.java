package org.avni.service;

import com.auth0.jwk.*;
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTDecodeException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.Verification;
import com.google.common.base.Strings;
import org.avni.dao.UserRepository;
import org.avni.domain.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StringUtils;

import java.net.MalformedURLException;
import java.net.URL;
import java.security.interfaces.RSAPublicKey;

public abstract class BaseIAMService implements IAMAuthService {
    private final Logger logger = LoggerFactory.getLogger(BaseIAMService.class);
    private final UserRepository userRepository;

    protected BaseIAMService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private String getValueInToken(DecodedJWT jwt, String name) {
        Claim claim = jwt.getClaim(name);
        if (claim.isNull()) return null;
        return claim.asString();
    }

    @Override
    public User getUserFromToken(String token) {
        logConfiguration();
        if (StringUtils.isEmpty(token)) return null;

        DecodedJWT jwt = verifyAndDecodeToken(token, true);
        if (jwt == null) return null;

        String username = getValueInToken(jwt, getUsernameField());
        String userUUID = getValueInToken(jwt, getUserUuidField());
        return Strings.isNullOrEmpty(userUUID)
                ? userRepository.findByUsername(username)
                : userRepository.findByUuid(userUUID);
    }

    protected abstract String getUserUuidField();

    protected abstract String getUsernameField();

    private DecodedJWT verifyAndDecodeToken(String token, boolean verify) {
        try {
            DecodedJWT unverifiedJwt = JWT.decode(token);
            if (!verify) return unverifiedJwt;

            JwkProvider provider = new GuavaCachedJwkProvider(new UrlJwkProvider(new URL(getJwkProviderUrl())));
            Jwk jwk = provider.get(unverifiedJwt.getKeyId());
            RSAPublicKey publicKey = (RSAPublicKey) jwk.getPublicKey();
            Algorithm algorithm = Algorithm.RSA256(publicKey, null);
            Verification verification = JWT.require(algorithm)
                    .withIssuer(getIssuer())
                    .withAudience(getAudience())
                    .acceptLeeway(240);
            addClaim(verification);
            JWTVerifier verifier = verification.build();
            logger.debug(String.format("Verifying token for issuer: %s, token_use: id and audience: %s", this.getIssuer(), getAudience()));
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

    protected abstract void addClaim(Verification verification);

    protected abstract String getAudience();

    protected abstract String getJwkProviderUrl();
    protected abstract String getIssuer();
    public abstract void logConfiguration();
}
