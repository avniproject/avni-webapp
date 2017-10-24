package org.openchs.service;

import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@Profile({"dev", "test", "default"})
public class StubbedAuthService implements AuthService {
    private static final Map<String, Boolean> DEFAULT_ROLES = new HashMap<String, Boolean>() {{
        put("admin", true);
        put("user", true);
    }};

    private static final ResponseEntity<Map<String, String>> DEFAULT_RESPONSE = new ResponseEntity<>(new HashMap<String, String>() {{
        put("authToken", UUID.randomUUID().toString());
    }}, HttpStatus.OK);

    @Override
    public ResponseEntity<Map<String, String>> login(String username, String password) {
        return StubbedAuthService.DEFAULT_RESPONSE;
    }

    @Override
    public Map<String, Boolean> validate(String token) {
        return StubbedAuthService.DEFAULT_ROLES;
    }
}
