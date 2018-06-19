package org.openchs.service;

import org.openchs.domain.UserContext;

public interface UserContextService {
    UserContext getUserContext(String token, String becomeOrganisationName);
    void setUserForInDevMode(UserContext userContext);
}
