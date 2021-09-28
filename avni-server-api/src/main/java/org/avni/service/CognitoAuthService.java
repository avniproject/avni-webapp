package org.avni.service;

import org.avni.domain.User;

public interface CognitoAuthService {
    User getUserFromToken(String token);
}
