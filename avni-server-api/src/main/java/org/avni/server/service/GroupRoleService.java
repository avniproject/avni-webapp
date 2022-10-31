package org.avni.server.service;

import org.avni.server.dao.GroupRoleRepository;
import org.avni.server.domain.GroupRole;
import org.avni.server.domain.SubjectType;
import org.avni.server.web.request.GroupRoleContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.joda.time.DateTime;
import java.util.UUID;

@Service
public class GroupRoleService implements NonScopeAwareService {
    private final GroupRoleRepository groupRoleRepository;
    private final Logger logger;

    @Autowired
    public GroupRoleService(GroupRoleRepository groupRoleRepository) {
        this.groupRoleRepository = groupRoleRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    public GroupRole saveGroupRole(GroupRoleContract groupRoleRequest, SubjectType groupSubjectType, SubjectType memberSubjectType) {
        logger.info(String.format("Creating Group Role: %s", groupRoleRequest.getRole()));
        GroupRole groupRole = groupRoleRepository.findByUuid(groupRoleRequest.getUuid());
        if (groupRole == null) {
            groupRole = new GroupRole();
            groupRole.setUuid(groupRoleRequest.getUuid() == null ? UUID.randomUUID().toString() : groupRoleRequest.getUuid());
        }
        groupRole.setGroupSubjectType(groupSubjectType);
        groupRole.setMemberSubjectType(memberSubjectType);
        groupRole.setRole(groupRoleRequest.getRole());
        groupRole.setPrimary(groupRoleRequest.getPrimary());
        groupRole.setMaximumNumberOfMembers(groupRoleRequest.getMaximumNumberOfMembers());
        groupRole.setMinimumNumberOfMembers(groupRoleRequest.getMinimumNumberOfMembers());
        return groupRoleRepository.save(groupRole);
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return groupRoleRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}
