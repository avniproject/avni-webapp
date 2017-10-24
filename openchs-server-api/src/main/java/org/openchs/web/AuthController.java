package org.openchs.web;

import org.openchs.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class AuthController {

    private final AuthService authService;

    public static final String LOGIN_URL = "/login";

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @RequestMapping(value = AuthController.LOGIN_URL, method = RequestMethod.POST)
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> credentials) {
        return this.authService.login(credentials.get("username"), credentials.get("password"));
    }
}
