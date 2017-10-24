package org.openchs.service;

import org.apache.http.entity.ContentType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import javax.validation.constraints.NotNull;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Service
@Profile({"live"})
public class MetabaseAuthService implements AuthService {
    public static final String SUPERUSER_KEY = "is_superuser";
    @Value("${auth.server.url}")
    private String METABASE_URL;

    private final RestTemplate rest;
    public static final String METABASE_LOGIN_PATH = "/api/session";
    public static final String METABASE_USER_PATH = "/api/user/current";
    public static final String METABASE_AUTH_HEADER = "X-Metabase-Session";
    public static final String ADMIN_ROLE = "admin";
    public static final String USER_ROLE = "user";

    @Autowired
    public MetabaseAuthService(RestTemplate rest) {
        this.rest = rest;
    }

    @Override
    public ResponseEntity<Map<String, String>> login(String username, String password) {
        Map<String, String> credentials = new HashMap<>();
        Map<String, String> tokenMap = new HashMap<>();
        credentials.put("username", username);
        credentials.put("password", password);
        HttpEntity<Map<String, String>> httpEntity = new HttpEntity<>(credentials);
        ResponseEntity<? extends Map> response = rest.postForEntity(METABASE_URL + METABASE_LOGIN_PATH, httpEntity, tokenMap.getClass());
        String token = (String) response.getBody().get("id");
        return new ResponseEntity<>(new HashMap<String, String>() {{
            put("authToken", token);
        }}, response.getStatusCode());
    }

    @Override
    public Map<String, Boolean> validate(@NotNull String token) {
        MultiValueMap<String, String> headers = new LinkedMultiValueMap<>();
        headers.put(METABASE_AUTH_HEADER, Arrays.asList(token));
        headers.put(HttpHeaders.CONTENT_TYPE, Arrays.asList(ContentType.APPLICATION_JSON.getMimeType()));
        headers.put(HttpHeaders.ACCEPT, Arrays.asList(ContentType.APPLICATION_JSON.getMimeType()));
        HttpEntity httpEntity = new HttpEntity(headers);
        ResponseEntity<Map> responseObject = rest.exchange(METABASE_URL + METABASE_USER_PATH, HttpMethod.GET, httpEntity, Map.class);
        Boolean isSuperUser = Boolean.valueOf(String.valueOf(responseObject.getBody().getOrDefault(SUPERUSER_KEY, false)));
        Map<String, Boolean> response = new HashMap<>();
        response.put(USER_ROLE, responseObject.getStatusCode().equals(HttpStatus.OK));
        response.put(ADMIN_ROLE, isSuperUser);
        return response;
    }

}
