package org.openchs.service;

import org.openchs.domain.UserContext;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface AuthService {
    ResponseEntity<Map<String, String>> login(final String username, final String password);

    UserContext validate(String token);
}
