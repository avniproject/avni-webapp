package org.avni.server.service;

import org.avni.server.domain.User;

public interface IAMAuthService {
    User getUserFromToken(String token);
}
