package org.openchs.web;

import org.openchs.dao.GroupRoleRepository;
import org.openchs.dao.OperationalSubjectTypeRepository;
import org.openchs.dao.SubjectTypeRepository;
import org.openchs.domain.GroupRole;
import org.openchs.domain.OperationalSubjectType;
import org.openchs.domain.SubjectType;
import org.openchs.service.SubjectTypeService;
import org.openchs.util.ReactAdminUtil;
import org.openchs.web.request.SubjectTypeContract;
import org.openchs.web.request.webapp.GroupRoleContract;
import org.openchs.web.request.webapp.SubjectTypeContractWeb;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
public class SubjectTypeController implements RestControllerResourceProcessor<SubjectTypeContractWeb> {
    private final Logger logger;
    private final OperationalSubjectTypeRepository operationalSubjectTypeRepository;
    private final SubjectTypeService subjectTypeService;
    private final GroupRoleRepository groupRoleRepository;
    private SubjectTypeRepository subjectTypeRepository;

    @Autowired
    public SubjectTypeController(SubjectTypeRepository subjectTypeRepository, OperationalSubjectTypeRepository operationalSubjectTypeRepository, SubjectTypeService subjectTypeService, GroupRoleRepository groupRoleRepository) {
        this.subjectTypeRepository = subjectTypeRepository;
        this.operationalSubjectTypeRepository = operationalSubjectTypeRepository;
        this.subjectTypeService = subjectTypeService;
        this.groupRoleRepository = groupRoleRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/subjectTypes", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    public void save(@RequestBody List<SubjectTypeContract> subjectTypeRequests) {
        subjectTypeRequests.forEach(subjectTypeService::saveSubjectType);
    }

    @GetMapping(value = "/web/subjectType")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public PagedResources<Resource<SubjectTypeContractWeb>> getAll(Pageable pageable) {
        return wrap(operationalSubjectTypeRepository
                .findPageByIsVoidedFalse(pageable)
                .map(SubjectTypeContractWeb::fromOperationalSubjectType));
    }

    @GetMapping(value = "/web/subjectType/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public ResponseEntity getOne(@PathVariable("id") Long id) {
        OperationalSubjectType operationalSubjectType = operationalSubjectTypeRepository.findOne(id);
        if (operationalSubjectType.isVoided())
            return ResponseEntity.notFound().build();
        SubjectTypeContractWeb subjectTypeContractWeb = SubjectTypeContractWeb.fromOperationalSubjectType(operationalSubjectType);
        return new ResponseEntity<>(subjectTypeContractWeb, HttpStatus.OK);
    }

    @PostMapping(value = "/web/subjectType")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    ResponseEntity saveSubjectTypeForWeb(@RequestBody SubjectTypeContractWeb request) {
        SubjectType existingSubjectType =
                subjectTypeRepository.findByNameIgnoreCase(request.getName());
        OperationalSubjectType existingOperationalSubjectType =
                operationalSubjectTypeRepository.findByNameIgnoreCase(request.getName());
        if (existingSubjectType != null || existingOperationalSubjectType != null)
            return ResponseEntity.badRequest().body(
                    ReactAdminUtil.generateJsonError(String.format("SubjectType %s already exists", request.getName()))
            );
        SubjectType subjectType = new SubjectType();
        subjectType.assignUUID();
        subjectType.setName(request.getName());
        subjectType.setGroup(request.isGroup());
        subjectType.setHousehold(request.isHousehold());
        SubjectType savedSubjectType = subjectTypeRepository.save(subjectType);
        if (request.isHousehold()) {
            subjectType.setGroup(true);
            createDefaultHouseholdRoles(savedSubjectType);
        }
        if (subjectType.isGroup()) {
            saveGroupRoles(savedSubjectType, request.getGroupRoles());
        }
        OperationalSubjectType operationalSubjectType = new OperationalSubjectType();
        operationalSubjectType.assignUUID();
        operationalSubjectType.setName(request.getName());
        operationalSubjectType.setSubjectType(subjectType);
        operationalSubjectTypeRepository.save(operationalSubjectType);
        return ResponseEntity.ok(SubjectTypeContractWeb.fromOperationalSubjectType(operationalSubjectType));
    }

    @PutMapping(value = "/web/subjectType/{id}")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    public ResponseEntity updateSubjectTypeForWeb(@RequestBody SubjectTypeContractWeb request,
                                                  @PathVariable("id") Long id) {
        logger.info(String.format("Processing Subject Type update request: %s", request.toString()));
        if (request.getName().trim().equals(""))
            return ResponseEntity.badRequest().body(ReactAdminUtil.generateJsonError("Name can not be empty"));

        OperationalSubjectType operationalSubjectType = operationalSubjectTypeRepository.findOne(id);

        if (operationalSubjectType == null)
            return ResponseEntity.badRequest()
                    .body(ReactAdminUtil.generateJsonError(String.format("Subject Type with id '%d' not found", id)));

        SubjectType subjectType = operationalSubjectType.getSubjectType();

        subjectType.setName(request.getName());
        subjectType.setGroup(request.isGroup());
        subjectType.setHousehold(request.isHousehold());
        SubjectType savedSubjectType = subjectTypeRepository.save(subjectType);
        if (request.isHousehold()) {
            subjectType.setGroup(true);
            createDefaultHouseholdRoles(savedSubjectType);
        }
        if (subjectType.isGroup()) {
            saveGroupRoles(savedSubjectType, request.getGroupRoles());
        }
        operationalSubjectType.setName(request.getName());
        operationalSubjectTypeRepository.save(operationalSubjectType);

        return ResponseEntity.ok(SubjectTypeContractWeb.fromOperationalSubjectType(operationalSubjectType));
    }

    @DeleteMapping(value = "/web/subjectType/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @Transactional
    public ResponseEntity voidSubjectType(@PathVariable("id") Long id) {
        OperationalSubjectType operationalSubjectType = operationalSubjectTypeRepository.findOne(id);
        if (operationalSubjectType == null)
            return ResponseEntity.notFound().build();
        SubjectType subjectType = operationalSubjectType.getSubjectType();
        if (subjectType == null)
            return ResponseEntity.notFound().build();

        operationalSubjectType.setName(ReactAdminUtil.getVoidedName(operationalSubjectType.getName(), operationalSubjectType.getId()));
        operationalSubjectType.setVoided(true);
        subjectType.setName(ReactAdminUtil.getVoidedName(subjectType.getName(), subjectType.getId()));
        subjectType.setVoided(true);
        operationalSubjectTypeRepository.save(operationalSubjectType);
        subjectTypeRepository.save(subjectType);
        if (subjectType.isGroup()) {
            voidAllGroupRoles(subjectType);
        }
        return ResponseEntity.ok(null);
    }

    private void voidAllGroupRoles(SubjectType subjectType) {
        List<GroupRole> groupRoles = groupRoleRepository.findByGroupSubjectType_IdAndIsVoidedFalse(subjectType.getId())
                .stream().peek(groupRole -> groupRole.setVoided(true))
                .collect(Collectors.toList());
        groupRoleRepository.saveAll(groupRoles);
    }

    private void saveGroupRoles(SubjectType groupSubjectType, List<GroupRoleContract> groupRoleContracts) {
        List<GroupRole> groupRoles = groupRoleContracts.stream()
                .map(groupRoleContract -> getGroupRole(groupRoleContract, groupSubjectType))
                .collect(Collectors.toList());
        groupRoleRepository.saveAll(groupRoles);
    }

    private GroupRole getGroupRole(GroupRoleContract groupRoleContract, SubjectType groupSubjectType) {
        GroupRole groupRole = groupRoleRepository.findByUuid(groupRoleContract.getGroupRoleUUID());
        if (groupRole == null) {
            groupRole = new GroupRole();
        }
        groupRole.setUuid(groupRoleContract.getGroupRoleUUID());
        groupRole.setGroupSubjectType(groupSubjectType);
        groupRole.setMemberSubjectType(subjectTypeRepository.findByName(groupRoleContract.getSubjectMemberName()));
        groupRole.setVoided(groupRoleContract.isVoided());
        groupRole.setRole(groupRoleContract.getRole());
        groupRole.setMinimumNumberOfMembers(groupRoleContract.getMinimumNumberOfMembers());
        groupRole.setMaximumNumberOfMembers(groupRoleContract.getMaximumNumberOfMembers());
        return groupRole;
    }

    private void createDefaultHouseholdRoles(SubjectType groupSubjectType) {
        SubjectType memberSubjectType = subjectTypeRepository.findByName("Individual");
        createRole(groupSubjectType, memberSubjectType, "Head of household", 1L);
        createRole(groupSubjectType, memberSubjectType, "Member", 100L);
    }

    private void createRole(SubjectType groupSubjectType, SubjectType memberSubjectType, String role, Long maxMembers) {
        GroupRole groupRole = new GroupRole();
        groupRole.setGroupSubjectType(groupSubjectType);
        groupRole.setMemberSubjectType(memberSubjectType);
        groupRole.setRole(role);
        groupRole.setUuid(UUID.randomUUID().toString());
        groupRole.setMaximumNumberOfMembers(maxMembers);
        groupRole.setMinimumNumberOfMembers(1L);
        groupRoleRepository.save(groupRole);
    }
}
