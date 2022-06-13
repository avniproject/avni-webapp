package org.avni.service;

import org.avni.domain.User;

public interface IAMAuthService {
    User getUserFromToken(String token);
}
