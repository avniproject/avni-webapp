package org.openchs.web;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.openchs.application.FormType;
import org.openchs.application.KeyType;
import org.openchs.application.Subject;
import org.openchs.dao.GroupRoleRepository;
import org.openchs.dao.OperationalSubjectTypeRepository;
import org.openchs.dao.SubjectTypeRepository;
import org.openchs.domain.GroupRole;
import org.openchs.domain.OperationalSubjectType;
import org.openchs.domain.SubjectType;
import org.openchs.service.*;
import org.openchs.util.ObjectMapperSingleton;
import org.openchs.util.ReactAdminUtil;
import org.openchs.web.request.SubjectTypeContract;
import org.openchs.web.request.webapp.SubjectTypeSetting;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
public class SubjectTypeController implements RestControllerResourceProcessor<SubjectTypeContractWeb> {
    private final Logger logger;
    private final OperationalSubjectTypeRepository operationalSubjectTypeRepository;
    private final SubjectTypeService subjectTypeService;
    private final GroupRoleRepository groupRoleRepository;
    private SubjectTypeRepository subjectTypeRepository;
    private FormService formService;
    private FormMappingService formMappingService;
    private OrganisationConfigService organisationConfigService;
    private ObjectMapper objectMapper;

    @Autowired
    public SubjectTypeController(SubjectTypeRepository subjectTypeRepository,
                                 OperationalSubjectTypeRepository operationalSubjectTypeRepository,
                                 SubjectTypeService subjectTypeService,
                                 GroupRoleRepository groupRoleRepository,
                                 FormService formService, FormMappingService formMappingService,
                                 OrganisationConfigService organisationConfigService) {
        this.subjectTypeRepository = subjectTypeRepository;
        this.operationalSubjectTypeRepository = operationalSubjectTypeRepository;
        this.subjectTypeService = subjectTypeService;
        this.groupRoleRepository = groupRoleRepository;
        this.formService = formService;
        this.formMappingService = formMappingService;
        this.organisationConfigService = organisationConfigService;
        objectMapper = ObjectMapperSingleton.getObjectMapper();
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
        List<SubjectTypeSetting> customRegistrationLocations = objectMapper.convertValue(organisationConfigService.getSettingsByKey(KeyType.customRegistrationLocations.toString()), new TypeReference<List<SubjectTypeSetting>>() {});
        Optional<List<String>> locationUUIDs = customRegistrationLocations
                .stream()
                .filter(s -> s.getSubjectTypeUUID().equals(operationalSubjectType.getSubjectTypeUUID()))
                .map(SubjectTypeSetting::getLocationTypeUUIDs)
                .findFirst();
        subjectTypeContractWeb.setLocationTypeUUIDs(locationUUIDs.orElse(null));
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
        if(request.getType() == null){
            return ResponseEntity.badRequest().body(
                    ReactAdminUtil.generateJsonError("Can't save subjectType with empty type")
            );
        }
        SubjectType subjectType = new SubjectType();
        subjectType.assignUUID();
        subjectType.setName(request.getName());
        subjectType.setActive(request.getActive());
        subjectType.setType(Subject.valueOf(request.getType()));
        subjectType.setSubjectSummaryRule(request.getSubjectSummaryRule());
        SubjectType savedSubjectType = subjectTypeRepository.save(subjectType);
        if (Subject.Household.toString().equals(request.getType())) {
            subjectType.setGroup(true);
            subjectType.setHousehold(true);
            saveGroupRoles(savedSubjectType, request.getGroupRoles());
        }
        if (Subject.Group.toString().equals(request.getType())) {
            subjectType.setGroup(true);
            saveGroupRoles(savedSubjectType, request.getGroupRoles());
        }
        OperationalSubjectType operationalSubjectType = new OperationalSubjectType();
        operationalSubjectType.assignUUID();
        operationalSubjectType.setName(request.getName());
        operationalSubjectType.setSubjectType(subjectType);
        operationalSubjectTypeRepository.save(operationalSubjectType);

        formMappingService.saveFormMapping(
                new FormMappingParameterObject(subjectType.getUuid(), null, null),
                new FormMappingParameterObject(subjectType.getUuid(), null, null),
                formService.getOrCreateForm(request.getRegistrationFormUuid(),
                        String.format("%s Registration", subjectType.getName()),
                        FormType.IndividualProfile));

        organisationConfigService.saveCustomRegistrationLocations(request.getLocationTypeUUIDs(), subjectType);
        SubjectTypeContractWeb subjectTypeContractWeb = SubjectTypeContractWeb.fromOperationalSubjectType(operationalSubjectType);
        subjectTypeContractWeb.setLocationTypeUUIDs(request.getLocationTypeUUIDs());
        return ResponseEntity.ok(subjectTypeContractWeb);
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
        subjectType.setActive(request.getActive());
        subjectType.setType(Subject.valueOf(request.getType()));
        subjectType.setSubjectSummaryRule(request.getSubjectSummaryRule());
        SubjectType savedSubjectType = subjectTypeRepository.save(subjectType);
        if (Subject.Household.toString().equals(request.getType())) {
            subjectType.setGroup(true);
            subjectType.setHousehold(true);
            saveGroupRoles(savedSubjectType, request.getGroupRoles());
        }
        if (Subject.Group.toString().equals(request.getType())) {
            subjectType.setGroup(true);
            saveGroupRoles(savedSubjectType, request.getGroupRoles());
        }
        operationalSubjectType.setName(request.getName());
        operationalSubjectTypeRepository.save(operationalSubjectType);

        formMappingService.saveFormMapping(
                new FormMappingParameterObject(subjectType.getUuid(), null, null),
                new FormMappingParameterObject(subjectType.getUuid(), null, null),
                formService.getOrCreateForm(request.getRegistrationFormUuid(),
                        String.format("%s Registration", subjectType.getName()), FormType.IndividualProfile));

        organisationConfigService.saveCustomRegistrationLocations(request.getLocationTypeUUIDs(), subjectType);
        SubjectTypeContractWeb subjectTypeContractWeb = SubjectTypeContractWeb.fromOperationalSubjectType(operationalSubjectType);
        subjectTypeContractWeb.setLocationTypeUUIDs(request.getLocationTypeUUIDs());
        return ResponseEntity.ok(subjectTypeContractWeb);
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

        formMappingService.voidExistingFormMappings(new FormMappingParameterObject(subjectType.getUuid(), null, null), null);

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
}
