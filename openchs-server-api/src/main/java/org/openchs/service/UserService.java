package org.openchs.service;

import org.openchs.dao.GroupRepository;
import org.openchs.dao.OrganisationRepository;
import org.openchs.dao.UserGroupRepository;
import org.openchs.dao.UserRepository;
import org.openchs.domain.*;
import org.openchs.framework.security.UserContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService {
    private static Logger logger = LoggerFactory.getLogger(UserService.class);
    private UserRepository userRepository;
    private OrganisationRepository organisationRepository;
    private GroupRepository groupRepository;
    private UserGroupRepository userGroupRepository;

    @Autowired
    public UserService(UserRepository userRepository, OrganisationRepository organisationRepository, GroupRepository groupRepository, UserGroupRepository userGroupRepository) {
        this.userRepository = userRepository;
        this.organisationRepository = organisationRepository;
        this.groupRepository = groupRepository;
        this.userGroupRepository = userGroupRepository;
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
            user = userRepository.save(user);
            if (organisation.getParentOrganisationId() == null && user.isOrgAdmin()) {
                user.setCreatedBy(user);
                user.setLastModifiedBy(user);
            }
        }
        return userRepository.save(user);
    }

    public void addToDefaultUserGroup(User user) {
        if (user.getOrganisationId() != null) {
            UserGroup userGroup = new UserGroup();
            userGroup.setGroup(groupRepository.findByNameAndOrganisationId("Everyone", user.getOrganisationId()));
            userGroup.setUser(user);
            userGroup.setUuid(UUID.randomUUID().toString());
            userGroup.setOrganisationId(user.getOrganisationId());
            userGroupRepository.save(userGroup);
        }
    }
}