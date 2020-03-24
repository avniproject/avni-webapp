package org.openchs.web;

import org.openchs.dao.GroupRoleRepository;
import org.openchs.dao.SubjectTypeRepository;
import org.openchs.domain.GroupRole;
import org.openchs.domain.Organisation;
import org.openchs.domain.SubjectType;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.util.ReactAdminUtil;
import org.openchs.web.request.GroupRoleContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;
import java.util.UUID;

@RestController
public class GroupRoleController implements RestControllerResourceProcessor<GroupRoleContract> {

    private final Logger logger;
    private final GroupRoleRepository groupRoleRepository;
    private final SubjectTypeRepository subjectTypeRepository;

    @Autowired
    public GroupRoleController(GroupRoleRepository groupRoleRepository, SubjectTypeRepository subjectTypeRepository) {
        this.groupRoleRepository = groupRoleRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/groupRoles", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    public ResponseEntity save(@RequestBody GroupRoleContract groupRoleRequest) {
        if (groupRoleRepository.findByRole(groupRoleRequest.getRole()) != null) {
            return ResponseEntity.badRequest().body(ReactAdminUtil.generateJsonError(String.format("Group with role %s already exists", groupRoleRequest.getRole())));
        }
        SubjectType groupSubjectType = subjectTypeRepository.findByUuid(groupRoleRequest.getGroupSubjectTypeUUID());
        SubjectType memberSubjectType = subjectTypeRepository.findByUuid(groupRoleRequest.getMemberSubjectTypeUUID());
        if (groupSubjectType == null || memberSubjectType == null) {
            return ResponseEntity.badRequest().body(ReactAdminUtil.generateJsonError("Cannot create Group Role. Either groupSubjectType or memberSubjectType does not exists."));
        }
        logger.info(String.format("Creating Group Role: %s", groupRoleRequest.getRole()));
        GroupRole groupRole = groupRoleRepository.save(createGroupRole(groupRoleRequest, groupSubjectType, memberSubjectType));
        return new ResponseEntity<>(groupRole, HttpStatus.CREATED);
    }

    private GroupRole createGroupRole(GroupRoleContract groupRoleRequest, SubjectType groupSubjectType, SubjectType memberSubjectType) {
        GroupRole groupRole = new GroupRole();
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        groupRole.setGroupSubjectType(groupSubjectType);
        groupRole.setMemberSubjectType(memberSubjectType);
        groupRole.setRole(groupRoleRequest.getRole());
        groupRole.setPrimary(groupRoleRequest.isPrimary());
        groupRole.setMaximumNumberOfMembers(groupRoleRequest.getMaximumNumberOfMembers());
        groupRole.setMinimumNumberOfMembers(groupRoleRequest.getMinimumNumberOfMembers());
        groupRole.setUuid(groupRoleRequest.getUuid() == null ? UUID.randomUUID().toString() : groupRoleRequest.getUuid());
        groupRole.setOrganisationId(organisation.getId());
        return groupRole;
    }

}
