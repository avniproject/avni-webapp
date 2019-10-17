package org.openchs.service;

import org.openchs.domain.User;

public interface CognitoAuthService {
    User getUserFromToken(String token);
}
