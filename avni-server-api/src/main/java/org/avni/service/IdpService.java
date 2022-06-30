package org.avni.service;

import org.avni.domain.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public abstract class IdpService {
    protected final String TEMPORARY_PASSWORD = "password";
    protected final Logger logger;
    protected Boolean isDev;
    public IdpService(Boolean isDev) {
        logger = LoggerFactory.getLogger(this.getClass());
        this.isDev = isDev;
    }
    public Boolean exists(User user) {
        if (isDev && !idpInDev()) {
            logger.info("Skipping Cognito EXISTS in dev mode...");
            return true;
        }
        return existsInIDP(user);
    }
    public void createUserIfNotExists(User user) {
        if(!this.exists(user)) {
            this.createUser(user);
        }
    }
    public abstract void createUser(User user);
    public abstract void updateUser(User user);
    public abstract void disableUser(User user);
    public abstract void deleteUser(User user);
    public abstract void enableUser(User user);
    public abstract void resetPassword(User user, String password);
    public abstract void createUserWithPassword(User user, String password);
    protected abstract boolean idpInDev();
    protected abstract Boolean existsInIDP(User user);
}
