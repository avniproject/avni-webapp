package org.openchs.service;

import org.openchs.domain.UserContext;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface AuthService {
    UserContext validate(String token);
}
