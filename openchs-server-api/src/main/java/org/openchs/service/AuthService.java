package org.openchs.service;

import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface AuthService {
    ResponseEntity<Map<String, String>> login(final String username, final String password);

    Map<String, Boolean> validate(String token);
}
