package org.openchs.service;

import org.openchs.dao.OrganisationRepository;
import org.openchs.domain.Organisation;
import org.openchs.domain.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@Profile({"test", "dev"})
public class StubbedUserContextService implements UserContextService {

    private OrganisationRepository organisationRepository;

    @Autowired
    public StubbedUserContextService(OrganisationRepository organisationRepository) {
        this.organisationRepository = organisationRepository;
    }

    @Override
    public UserContext getUserContext(String token, String becomeOrganisationName) {
        UserContext userContext = new UserContext();
        userContext.setOrganisation(findOrganisation(becomeOrganisationName));
        userContext.addUserRole().addAdminRole().addOrganisationAdminRole();
        return userContext;
    }

    private Organisation findOrganisation(String becomeOrganisationName) {
        String organisationName = StringUtils.isEmpty(becomeOrganisationName)? "demo": becomeOrganisationName.trim();
        return organisationRepository.findByName(organisationName);
    }
}
