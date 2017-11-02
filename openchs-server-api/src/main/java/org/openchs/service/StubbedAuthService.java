package org.openchs.service;

import org.openchs.dao.OrganisationRepository;
import org.openchs.domain.Organisation;
import org.openchs.domain.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@Profile({"dev", "test", "default", "live"})
public class StubbedAuthService implements AuthService {
    public static final String USER = "user";
    public static final String ADMIN = "admin";
    private String OPENCHS_AUTH_TOKEN = "eef19d24-8ce3-4b4e-b848-0845a9b7822e";
    private String DUMMY_AUTH_TOKEN = "8b752048-4ef9-4a28-85c2-695319f3f125";

    private OrganisationRepository organisationRepository;

    @Autowired
    public StubbedAuthService(OrganisationRepository organisationRepository) {
        this.organisationRepository = organisationRepository;
    }

    @Override
    public ResponseEntity<Map<String, String>> login(String username, String password) {
        String uuid = username.equalsIgnoreCase("openchs")? OPENCHS_AUTH_TOKEN: DUMMY_AUTH_TOKEN;
        return new ResponseEntity<>(new HashMap<String, String>() {{
            put("authToken", uuid);
        }}, HttpStatus.OK);
    }

    @Override
    public UserContext validate(String token) {
        UserContext userContext = new UserContext();
        userContext.setOrganisation(findOrganisation(token));
        userContext.setRoles(Arrays.asList(ADMIN, USER));
        return userContext;
    }

    private Organisation findOrganisation(String token) {
        return organisationRepository.findByName(token.equals(OPENCHS_AUTH_TOKEN)? "openchs": "dummy");
    }
}
