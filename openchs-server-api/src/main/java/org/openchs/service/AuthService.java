package org.openchs.service;

import org.springframework.http.ResponseEntity;

public interface AuthService {
    ResponseEntity<String> login(final String username, final String password);
}
