package org.openchs.web;

import org.openchs.dao.GroupRoleRepository;
import org.openchs.dao.SubjectTypeRepository;
import org.openchs.domain.GroupRole;
import org.openchs.domain.SubjectType;
import org.openchs.service.GroupRoleService;
import org.openchs.util.ReactAdminUtil;
import org.openchs.web.request.GroupRoleContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;

@RestController
public class GroupRoleController implements RestControllerResourceProcessor<GroupRoleContract> {

    private final GroupRoleRepository groupRoleRepository;
    private final SubjectTypeRepository subjectTypeRepository;
    private final GroupRoleService groupRoleService;

    @Autowired
    public GroupRoleController(GroupRoleRepository groupRoleRepository, SubjectTypeRepository subjectTypeRepository, GroupRoleService groupRoleService) {
        this.groupRoleRepository = groupRoleRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.groupRoleService = groupRoleService;
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
        GroupRole groupRole = groupRoleService.saveGroupRole(groupRoleRequest, groupSubjectType, memberSubjectType);
        return new ResponseEntity<>(groupRole, HttpStatus.CREATED);
    }

}
