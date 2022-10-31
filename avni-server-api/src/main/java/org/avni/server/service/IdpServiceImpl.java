package org.avni.server.service;

import org.avni.server.domain.OrganisationConfig;
import org.avni.server.domain.User;
import org.avni.server.domain.ValidationException;
import org.avni.server.framework.context.SpringProfiles;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.StringTokenizer;

public abstract class IdpServiceImpl implements IdpService {
    private static final Logger logger = LoggerFactory.getLogger(IdpServiceImpl.class);
    protected final SpringProfiles springProfiles;

    public IdpServiceImpl(SpringProfiles springProfiles) {
        this.springProfiles = springProfiles;
    }

    @Override
    public Boolean exists(User user) {
        if (springProfiles.isDev() && !idpInDev()) {
            logger.info("Skipping Cognito EXISTS in dev mode...");
            return true;
        }
        return existsInIDP(user);
    }

    @Override
    public void createUserIfNotExists(User user, OrganisationConfig organisationConfig) {
        if (!this.exists(user)) {
            this.createUser(user, organisationConfig);
        }
    }

    public static String getDefaultPassword(User user) {
        int phoneNumberLength = user.getPhoneNumber().length();
        return String.format("%s%s", user.getUsername().substring(0, 4), user.getPhoneNumber().substring(phoneNumberLength - 4, phoneNumberLength));
    }
}
