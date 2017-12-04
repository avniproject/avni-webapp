package org.openchs.service;

import org.openchs.dao.OrganisationRepository;
import org.openchs.domain.Organisation;
import org.openchs.domain.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile({"test", "dev"})
public class StubbedUserContextService implements UserContextService {
    public static final String OPENCHS_AUTH_TOKEN = "eef19d24-8ce3-4b4e-b848-0845a9b7822e";

    private OrganisationRepository organisationRepository;

    @Autowired
    public StubbedUserContextService(OrganisationRepository organisationRepository) {
        this.organisationRepository = organisationRepository;
    }

    @Override
    public UserContext getUserContext(String token) {
        UserContext userContext = new UserContext();
        userContext.setOrganisation(findOrganisation(token));
        userContext.addUserRole().addAdminRole().addOrganisationAdminRole();
        return userContext;
    }

    private Organisation findOrganisation(String token) {
        return organisationRepository.findByName(OPENCHS_AUTH_TOKEN.equals(token)? "OpenCHS": "dummy");
    }
}
