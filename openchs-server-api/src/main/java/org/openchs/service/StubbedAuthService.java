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
@Profile({"dev", "test"})
public class StubbedAuthService implements AuthService {
    public static final String USER = "user";
    public static final String ADMIN = "admin";
    public static final String OPENCHS_AUTH_TOKEN = "eef19d24-8ce3-4b4e-b848-0845a9b7822e";

    private OrganisationRepository organisationRepository;

    @Autowired
    public StubbedAuthService(OrganisationRepository organisationRepository) {
        this.organisationRepository = organisationRepository;
    }

    @Override
    public UserContext validate(String token) {
        UserContext userContext = new UserContext();
        userContext.setOrganisation(findOrganisation(token));
        userContext.addUserRole().addAdminRole().addUserAdminRole();
        return userContext;
    }

    private Organisation findOrganisation(String token) {
        return organisationRepository.findByName(OPENCHS_AUTH_TOKEN.equals(token)? "OpenCHS": "dummy");
    }
}
