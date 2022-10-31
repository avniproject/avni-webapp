package org.avni.server.service;

import org.avni.server.dao.GroupRepository;
import org.avni.server.dao.OrganisationRepository;
import org.avni.server.dao.UserGroupRepository;
import org.avni.server.dao.UserRepository;
import org.avni.server.domain.Organisation;
import org.avni.server.domain.User;
import org.avni.server.domain.UserContext;
import org.avni.server.domain.UserGroup;
import org.avni.server.framework.security.UserContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.joda.time.DateTime;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserService implements NonScopeAwareService {
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

    public User getCurrentUser() {
        UserContext userContext = UserContextHolder.getUserContext();
        return userContext.getUser();
    }

    @Transactional
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

    @Transactional
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

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return userRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }

    @Transactional
    public User findByUuid(String uuid) {
        return userRepository.findByUuid(uuid);
    }
}
