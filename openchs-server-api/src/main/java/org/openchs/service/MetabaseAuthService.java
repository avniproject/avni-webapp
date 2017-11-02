package org.openchs.service;

import org.apache.http.entity.ContentType;
import org.openchs.dao.OrganisationRepository;
import org.openchs.domain.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import javax.validation.constraints.NotNull;
import java.util.*;

@Service
@Profile({"dummy"})
public class MetabaseAuthService implements AuthService {
    public static final String SUPERUSER_KEY = "is_superuser";
    public static final String EMAIL = "email";
    @Value("${auth.server.url}")
    private String METABASE_URL;

    private OrganisationRepository organisationRepository;

    private final RestTemplate rest;
    public static final String METABASE_LOGIN_PATH = "/api/session";
    public static final String METABASE_USER_PATH = "/api/user/current";
    public static final String METABASE_AUTH_HEADER = "X-Metabase-Session";
    public static final String ADMIN_ROLE = "admin";
    public static final String USER_ROLE = "user";

    @Autowired
    public MetabaseAuthService(RestTemplate rest, OrganisationRepository organisationRepository) {
        this.rest = rest;
        this.organisationRepository = organisationRepository;
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
    public UserContext validate(@NotNull String token) {
        ResponseEntity<Map> responseObject = validateWithMetabase(token);
        boolean isSuperUser = Boolean.valueOf(String.valueOf(responseObject.getBody().getOrDefault(SUPERUSER_KEY, false)));
        boolean isUser = responseObject.getStatusCode().equals(HttpStatus.OK);

        UserContext userContext = new UserContext();

        List roles = new ArrayList();
        if (isSuperUser) roles.add(ADMIN_ROLE);
        if (isUser) roles.add(USER_ROLE);
        userContext.setRoles(roles);

        userContext.setUserName(String.valueOf(responseObject.getBody().get(EMAIL)));
        userContext.setOrganisation(organisationRepository.findByName(userContext.getUserName()));

        return userContext;
    }

    private ResponseEntity<Map> validateWithMetabase(@NotNull String token) {
        MultiValueMap<String, String> headers = new LinkedMultiValueMap<>();
        headers.put(METABASE_AUTH_HEADER, Arrays.asList(token));
        headers.put(HttpHeaders.CONTENT_TYPE, Arrays.asList(ContentType.APPLICATION_JSON.getMimeType()));
        headers.put(HttpHeaders.ACCEPT, Arrays.asList(ContentType.APPLICATION_JSON.getMimeType()));
        HttpEntity httpEntity = new HttpEntity(headers);
        return rest.exchange(METABASE_URL + METABASE_USER_PATH, HttpMethod.GET, httpEntity, Map.class);
    }
}
