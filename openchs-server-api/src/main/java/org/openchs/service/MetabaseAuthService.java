package org.openchs.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class MetabaseAuthService implements AuthService {
    @Value("${auth.server.url}")
    private String metabaseURL;
    private static final String metabaseLoginPath = "/api/session";

    @Autowired
    public MetabaseAuthService() {

    }

    @Override
    public ResponseEntity<String> login(String username, String password) {
        Map<String, String> credentials = new HashMap<>();
        Map<String, String> tokenMap = new HashMap<>();
        credentials.put("username", username);
        credentials.put("password", password);
//        HttpEntity<Map<String, String>> httpEntity = new HttpEntity<>(credentials, headers);
//        ResponseEntity<? extends Map> response = rest.postForEntity(metabaseURL + metabaseLoginPath, httpEntity, tokenMap.getClass());
//        String token = (String) response.getBody().get("id");
//        return new ResponseEntity<>(token, response.getStatusCode());
        return null;
    }
}
