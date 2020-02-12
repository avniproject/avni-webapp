package org.openchs.service;

import org.openchs.dao.OrganisationRepository;
import org.openchs.dao.UserRepository;
import org.openchs.domain.Facility;
import org.openchs.domain.Organisation;
import org.openchs.domain.User;
import org.openchs.domain.UserContext;
import org.openchs.framework.security.UserContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private UserRepository userRepository;
    private static Logger logger = LoggerFactory.getLogger(UserService.class);
    private OrganisationRepository organisationRepository;

    @Autowired
    public UserService(UserRepository userRepository, OrganisationRepository organisationRepository) {
        this.userRepository = userRepository;
        this.organisationRepository = organisationRepository;
    }

    public Facility getUserFacility() {
        UserContext userContext = UserContextHolder.getUserContext();
        return userContext.getUser().getFacility();
    }

    public User getCurrentUser() {
        UserContext userContext = UserContextHolder.getUserContext();
        return userContext.getUser();
    }

    public User save(User user) {
        if (user.getOrganisationId() != null) {
            Organisation organisation = organisationRepository.findOne(user.getOrganisationId());
            if (organisation.getParentOrganisationId() == null && user.isOrgAdmin()) {
                user.setCreatedBy(user);
                user.setLastModifiedBy(user);
            }
        }
        user = userRepository.save(user);
        return userRepository.save(user);
    }
}