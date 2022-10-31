package org.avni.server.service;

import org.avni.server.domain.OrganisationConfig;
import org.avni.server.domain.User;

public interface IdpService {
    void createUser(User user, OrganisationConfig organisationConfig);

    void updateUser(User user);

    void disableUser(User user);

    void deleteUser(User user);

    void enableUser(User user);

    void resetPassword(User user, String password);

    void createUserWithPassword(User user, String password, OrganisationConfig organisationConfig);

    boolean idpInDev();

    Boolean existsInIDP(User user);

    Boolean exists(User user);

    void createUserIfNotExists(User user, OrganisationConfig organisationConfig);
}
