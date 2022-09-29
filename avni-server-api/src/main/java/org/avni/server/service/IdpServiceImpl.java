package org.avni.server.service;

import org.avni.server.domain.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public abstract class IdpServiceImpl implements IdpService {
    protected final String TEMPORARY_PASSWORD = "password";
    protected final Logger logger;
    protected Boolean isDev;
    public IdpServiceImpl(Boolean isDev) {
        logger = LoggerFactory.getLogger(this.getClass());
        this.isDev = isDev;
    }
    @Override
    public Boolean exists(User user) {
        if (isDev && !idpInDev()) {
            logger.info("Skipping Cognito EXISTS in dev mode...");
            return true;
        }
        return existsInIDP(user);
    }
    @Override
    public void createUserIfNotExists(User user) {
        if(!this.exists(user)) {
            this.createUser(user);
        }
    }
}
