package org.avni.service;

import org.avni.dao.*;
import org.avni.domain.*;
import org.avni.framework.security.UserContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.joda.time.DateTime;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
public class UserService implements NonScopeAwareService {
    private static Logger logger = LoggerFactory.getLogger(UserService.class);
    private UserRepository userRepository;
    private OrganisationRepository organisationRepository;
    private GroupRepository groupRepository;
    private UserGroupRepository userGroupRepository;
    private UserSubjectAssignmentRepository userSubjectAssignmentRepository;
    private IndividualRepository individualRepository;

    @Autowired
    public UserService(UserRepository userRepository, OrganisationRepository organisationRepository, GroupRepository groupRepository, UserGroupRepository userGroupRepository, UserSubjectAssignmentRepository userSubjectAssignmentRepository, IndividualRepository individualRepository) {
        this.userRepository = userRepository;
        this.organisationRepository = organisationRepository;
        this.groupRepository = groupRepository;
        this.userGroupRepository = userGroupRepository;
        this.userSubjectAssignmentRepository = userSubjectAssignmentRepository;
        this.individualRepository = individualRepository;
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

    public User save(User user, Set<Long> directAssignmentIds) throws Exception {
        User savedUser = this.save(user);
        userSubjectAssignmentRepository.deleteAllByUser(savedUser.getId());
        if (directAssignmentIds != null) {
            saveDirectAssignment(user, directAssignmentIds);
        }
        return savedUser;
    }

    private void saveDirectAssignment(User user, Set<Long> directAssignmentIds) throws Exception {
        Set<UserSubjectAssignment> userSubjectAssignments = new HashSet<>();
        for (Long subjectId : directAssignmentIds) {
            Individual individual = individualRepository.findOne(subjectId);
            if (individual == null) {
                throw new Exception(String.format("Subject id %d not found", subjectId));
            }
            UserSubjectAssignment userSubjectAssignment = new UserSubjectAssignment(user, individual);
            userSubjectAssignment.assignUUID();
            userSubjectAssignments.add(userSubjectAssignment);
        }
        userSubjectAssignmentRepository.saveAll(userSubjectAssignments);
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

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return userRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}
