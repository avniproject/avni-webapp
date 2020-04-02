package org.openchs.web;

import org.apache.commons.collections4.IterableUtils;
import org.openchs.application.FormMapping;
import org.openchs.dao.*;
import org.openchs.dao.application.FormMappingRepository;
import org.openchs.domain.*;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.web.request.GroupPrivilegeContract;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
public class GroupPrivilegeController extends AbstractController<GroupPrivilege> implements RestControllerResourceProcessor<GroupPrivilege> {
    private GroupPrivilegeRepository groupPrivilegeRepository;
    private GroupRepository groupRepository;
    private PrivilegeRepository privilegeRepository;
    private SubjectTypeRepository subjectTypeRepository;
    private ProgramRepository programRepository;
    private EncounterTypeRepository encounterTypeRepository;
    private ChecklistDetailRepository checklistDetailRepository;
    private FormMappingRepository formMappingRepository;

    public GroupPrivilegeController(GroupPrivilegeRepository groupPrivilegeRepository, GroupRepository groupRepository, PrivilegeRepository privilegeRepository, SubjectTypeRepository subjectTypeRepository, ProgramRepository programRepository, EncounterTypeRepository encounterTypeRepository, ChecklistDetailRepository checklistDetailRepository, FormMappingRepository formMappingRepository) {
        this.groupPrivilegeRepository = groupPrivilegeRepository;
        this.groupRepository = groupRepository;
        this.privilegeRepository = privilegeRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.programRepository = programRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.checklistDetailRepository = checklistDetailRepository;
        this.formMappingRepository = formMappingRepository;
    }

    @RequestMapping(value = "/groups/{id}/privileges", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    public List<GroupPrivilegeContract> getById(@PathVariable("id") Long id) {
        List<GroupPrivilege> allPrivileges = getAllGroupPrivileges(id);
        List<GroupPrivilege> groupPrivileges = groupPrivilegeRepository.findByGroup_Id(id);
        groupPrivileges.addAll(allPrivileges);
        return groupPrivileges.stream()
                .map(GroupPrivilegeContract::fromEntity)
                .distinct()
                .collect(Collectors.toList());
    }

    @RequestMapping(value = "/groupPrivilege", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    public ResponseEntity addOrUpdateGroupPrivileges(@RequestBody List<GroupPrivilegeContract> request) {
        List<GroupPrivilege> privilegesToBeAddedOrUpdated = new ArrayList<>();

        for (GroupPrivilegeContract groupPrivilege : request) {
            if (groupPrivilege.getGroupPrivilegeId() != null) {
                Optional<GroupPrivilege> groupPriv = groupPrivilegeRepository.findById(groupPrivilege.getGroupPrivilegeId());
                if (groupPriv.isPresent()) {
                    groupPriv.get().setAllow(groupPrivilege.isAllow());
                } else {
                    return ResponseEntity.badRequest().body(String.format("Invalid group privilege id %d", groupPrivilege.getGroupPrivilegeId()));
                }
                privilegesToBeAddedOrUpdated.add(groupPriv.get());
            } else {
                Optional<Privilege> optionalPrivilege = privilegeRepository.findById(groupPrivilege.getPrivilegeId());
                Group group = groupRepository.findOne(groupPrivilege.getGroupId());
                SubjectType subjectType = subjectTypeRepository.findOne(groupPrivilege.getSubjectTypeId());

                if (!optionalPrivilege.isPresent() || group == null || subjectType == null) {
                    return ResponseEntity.badRequest().body(String.format("Invalid privilege id %d or group id %d or subject type %s", groupPrivilege.getPrivilegeId(), groupPrivilege.getGroupId(), groupPrivilege.getSubjectTypeName()));
                }

                GroupPrivilege newGroupPrivilege = new GroupPrivilege();
                newGroupPrivilege.assignUUID();
                newGroupPrivilege.setPrivilege(optionalPrivilege.get());
                newGroupPrivilege.setGroup(group);
                newGroupPrivilege.setOrganisationId(UserContextHolder.getUserContext().getOrganisationId());
                newGroupPrivilege.setSubjectType(subjectType);
                newGroupPrivilege.setProgram(groupPrivilege.getProgramId().isPresent() ? programRepository.findOne(groupPrivilege.getProgramId().get()) : null);
                newGroupPrivilege.setEncounterType(groupPrivilege.getEncounterTypeId().isPresent() ? encounterTypeRepository.findOne(groupPrivilege.getEncounterTypeId().get()) : null);
                newGroupPrivilege.setProgramEncounterType(groupPrivilege.getProgramEncounterTypeId().isPresent() ? encounterTypeRepository.findOne(groupPrivilege.getProgramEncounterTypeId().get()) : null);
                newGroupPrivilege.setChecklistDetail(groupPrivilege.getChecklistDetailId().isPresent() ? checklistDetailRepository.findOne(groupPrivilege.getChecklistDetailId().get()) : null);
                newGroupPrivilege.setAllow(groupPrivilege.isAllow());

                privilegesToBeAddedOrUpdated.add(newGroupPrivilege);
            }
        }

        return ResponseEntity.ok(groupPrivilegeRepository.saveAll(privilegesToBeAddedOrUpdated));
    }

    private List<GroupPrivilege> getAllGroupPrivileges(Long groupId) {

        List<FormMapping> formMappings = formMappingRepository.findAllOperational();
        List<SubjectType.SubjectTypeProjection> subjectTypes = subjectTypeRepository.findAllOperational();
        List<Program.ProgramProjection> operationalPrograms = programRepository.findAllOperational();
        Set<Long> operationalProgramIds = operationalPrograms.stream().map(Program.ProgramProjection::getId).collect(Collectors.toSet());
        List<EncounterType.EncounterTypeProjection> encounterTypes = encounterTypeRepository.findAllOperational();
        Set<Long> operationalEncounterTypeIds = encounterTypes.stream().map(EncounterType.EncounterTypeProjection::getId).collect(Collectors.toSet());
        List<ChecklistDetail> checklistDetails = checklistDetailRepository.findAllByOrganisationId(UserContextHolder.getUserContext().getOrganisationId());
        Group currentGroup = groupRepository.findOne(groupId);
        Iterable<Privilege> privileges = privilegeRepository.findAll();
        List<Privilege> privilegeList = IterableUtils.toList(privileges);
        List<GroupPrivilege> allPrivileges = new ArrayList<>();

        List<FormMapping> operationalFormMappings = formMappings.stream()
                .filter(formMapping -> formMapping.getProgram() != null && operationalProgramIds.contains(formMapping.getProgram().getId()))
                .filter(formMapping -> formMapping.getEncounterType() != null && operationalEncounterTypeIds.contains(formMapping.getEncounterType().getId()))
                .collect(Collectors.toList());

        operationalFormMappings.forEach(formMapping -> {
            if (formMapping.getSubjectTypeUuid() != null && formMapping.getEncounterTypeUuid() != null) {
                privilegeList.stream()
                        .filter(privilege -> privilege.getEntityType() == EntityType.Encounter)
                        .forEach(privilege -> {
                            GroupPrivilege groupPrivilege = new GroupPrivilege();
                            groupPrivilege.setGroup(currentGroup);
                            groupPrivilege.setPrivilege(privilege);
                            groupPrivilege.setSubjectType(subjectTypeRepository.findByUuid(formMapping.getSubjectTypeUuid()));
                            if (formMapping.getProgramUuid() != null) {
                                groupPrivilege.setProgram(programRepository.findByUuid(formMapping.getProgramUuid()));
                                groupPrivilege.setProgramEncounterType(encounterTypeRepository.findByUuid(formMapping.getEncounterTypeUuid()));
                            } else {
                                groupPrivilege.setEncounterType(encounterTypeRepository.findByUuid(formMapping.getEncounterTypeUuid()));
                            }
                            allPrivileges.add(groupPrivilege);
                        });
            } else if (formMapping.getSubjectTypeUuid() != null && formMapping.getProgramUuid() != null) {
                privilegeList.stream()
                        .filter(privilege -> privilege.getEntityType() == EntityType.Enrolment)
                        .forEach(privilege -> {
                            GroupPrivilege groupPrivilege = new GroupPrivilege();
                            groupPrivilege.setGroup(currentGroup);
                            groupPrivilege.setPrivilege(privilege);
                            groupPrivilege.setSubjectType(subjectTypeRepository.findByUuid(formMapping.getSubjectTypeUuid()));
                            groupPrivilege.setProgram(programRepository.findByUuid(formMapping.getProgramUuid()));
                            allPrivileges.add(groupPrivilege);
                        });
            } else if (formMapping.getSubjectTypeUuid() != null) {
                privilegeList.stream()
                        .filter(privilege -> privilege.getEntityType() == EntityType.Subject)
                        .forEach(privilege -> {
                            GroupPrivilege groupPrivilege = new GroupPrivilege();
                            groupPrivilege.setGroup(currentGroup);
                            groupPrivilege.setPrivilege(privilege);
                            groupPrivilege.setSubjectType(subjectTypeRepository.findByUuid(formMapping.getSubjectTypeUuid()));
                            allPrivileges.add(groupPrivilege);
                        });
            }
        });
        checklistDetails.forEach(checklistDetail ->
                subjectTypes.forEach(subjectType ->
                        privilegeList.stream()
                                .filter(privilege -> privilege.getEntityType() == EntityType.Checklist)
                                .forEach(privilege -> {
                                    GroupPrivilege groupPrivilege = new GroupPrivilege();
                                    groupPrivilege.setGroup(currentGroup);
                                    groupPrivilege.setPrivilege(privilege);
                                    groupPrivilege.setSubjectType(subjectTypeRepository.findByUuid(subjectType.getUuid()));
                                    groupPrivilege.setChecklistDetail(checklistDetailRepository.findByUuid(checklistDetail.getUuid()));
                                    allPrivileges.add(groupPrivilege);
                                })
                )
        );
        return allPrivileges;
    }
}
