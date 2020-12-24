package org.openchs.service;

import org.openchs.dao.GroupRoleRepository;
import org.openchs.domain.GroupRole;
import org.openchs.domain.Organisation;
import org.openchs.domain.SubjectType;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.web.request.GroupRoleContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class GroupRoleService {
    private final GroupRoleRepository groupRoleRepository;
    private final Logger logger;

    @Autowired
    public GroupRoleService(GroupRoleRepository groupRoleRepository) {
        this.groupRoleRepository = groupRoleRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    public GroupRole saveGroupRole(GroupRoleContract groupRoleRequest, SubjectType groupSubjectType, SubjectType memberSubjectType) {
        logger.info(String.format("Creating Group Role: %s", groupRoleRequest.getRole()));
        GroupRole groupRole = new GroupRole();
        groupRole.setGroupSubjectType(groupSubjectType);
        groupRole.setMemberSubjectType(memberSubjectType);
        groupRole.setRole(groupRoleRequest.getRole());
        groupRole.setPrimary(groupRoleRequest.getPrimary());
        groupRole.setMaximumNumberOfMembers(groupRoleRequest.getMaximumNumberOfMembers());
        groupRole.setMinimumNumberOfMembers(groupRoleRequest.getMinimumNumberOfMembers());
        groupRole.setUuid(groupRoleRequest.getUuid() == null ? UUID.randomUUID().toString() : groupRoleRequest.getUuid());
        return groupRoleRepository.save(groupRole);
    }
}
