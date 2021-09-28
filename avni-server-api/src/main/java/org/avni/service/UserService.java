package org.avni.service;

import org.avni.dao.GroupRepository;
import org.avni.dao.OrganisationRepository;
import org.avni.dao.UserGroupRepository;
import org.avni.dao.UserRepository;
import org.avni.domain.*;
import org.avni.framework.security.UserContextHolder;
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
