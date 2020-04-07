package org.openchs.service;

import org.apache.commons.collections4.IterableUtils;
import org.openchs.application.FormMapping;
import org.openchs.dao.*;
import org.openchs.dao.application.FormMappingRepository;
import org.openchs.domain.*;
import org.openchs.framework.security.UserContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class GroupPrivilegeService {
    private GroupRepository groupRepository;
    private PrivilegeRepository privilegeRepository;
    private GroupPrivilegeRepository groupPrivilegeRepository;
    private SubjectTypeRepository subjectTypeRepository;
    private ProgramRepository programRepository;
    private EncounterTypeRepository encounterTypeRepository;
    private ChecklistDetailRepository checklistDetailRepository;
    private FormMappingRepository formMappingRepository;

    public GroupPrivilegeService(GroupRepository groupRepository, PrivilegeRepository privilegeRepository, SubjectTypeRepository subjectTypeRepository, ProgramRepository programRepository, EncounterTypeRepository encounterTypeRepository, ChecklistDetailRepository checklistDetailRepository, FormMappingRepository formMappingRepository, GroupPrivilegeRepository groupPrivilegeRepository) {
        this.groupRepository = groupRepository;
        this.privilegeRepository = privilegeRepository;
        this.groupPrivilegeRepository = groupPrivilegeRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.programRepository = programRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.checklistDetailRepository = checklistDetailRepository;
        this.formMappingRepository = formMappingRepository;
    }

    public GroupPrivilege assignEverythingPrivilegeToEveryoneGroup(Long orgId) {
        Group everyoneGroup = groupRepository.findByNameAndOrganisationId("Everyone", orgId);
        if (everyoneGroup != null) {
            GroupPrivilege everythingPrivilege = new GroupPrivilege();
            everythingPrivilege.setPrivilege(privilegeRepository.findByName("All Privileges"));
            everythingPrivilege.setGroup(everyoneGroup);
            everythingPrivilege.setOrganisationId(orgId);
            everythingPrivilege.setAllow(true);
            everythingPrivilege.assignUUID();
            return groupPrivilegeRepository.save(everythingPrivilege);
        } else {
            return null;
        }
    }

    public List<GroupPrivilege> getAllGroupPrivileges(Long groupId) {

        List<FormMapping> formMappings = formMappingRepository.findAll();
        List<SubjectType.SubjectTypeProjection> subjectTypes = subjectTypeRepository.findAllOperational();

        List<Program.ProgramProjection> operationalPrograms = programRepository.findAllOperational();
        Set<Long> operationalProgramIds = operationalPrograms.stream().map(Program.ProgramProjection::getId).collect(Collectors.toSet());

        List<EncounterType.EncounterTypeProjection> operationalEncounterTypes = encounterTypeRepository.findAllOperational();
        Set<Long> operationalEncounterTypeIds = operationalEncounterTypes.stream().map(EncounterType.EncounterTypeProjection::getId).collect(Collectors.toSet());

        List<ChecklistDetail> checklistDetails = checklistDetailRepository.findAllByOrganisationId(UserContextHolder.getUserContext().getOrganisationId());

        Group currentGroup = groupRepository.findOne(groupId);
        List<Privilege> privilegeList = IterableUtils.toList(privilegeRepository.findAll());

        List<FormMapping> operationalFormMappings = formMappings.stream()
                .filter(formMapping -> (formMapping.getProgram() == null) || (formMapping.getProgram() != null && operationalProgramIds.contains(formMapping.getProgram().getId())))
                .filter(formMapping -> formMapping.getEncounterType() != null && operationalEncounterTypeIds.contains(formMapping.getEncounterType().getId()))
                .collect(Collectors.toList());

        List<GroupPrivilege> allPrivileges = new ArrayList<>();

        subjectTypes.forEach(subjectTypeProjection -> {
            SubjectType subjectType = subjectTypeRepository.findByUuid(subjectTypeProjection.getUuid());
            privilegeList.stream()
                    .filter(privilege -> privilege.getEntityType() == EntityType.Subject)
                    .forEach(subjectPrivilege -> {
                                GroupPrivilege groupPrivilege = new GroupPrivilege();
                                groupPrivilege.setGroup(currentGroup);
                                groupPrivilege.setPrivilege(subjectPrivilege);
                                groupPrivilege.setSubjectType(subjectType);
                                groupPrivilege.setAllow(false);
                                allPrivileges.add(groupPrivilege);
                            }
                    );

            operationalFormMappings.forEach(operationalFormMapping -> {
                if (operationalFormMapping.getSubjectType() != subjectType) return;

                Program program = operationalFormMapping.getProgram();
                if (program != null) {
                    privilegeList.stream()
                            .filter(privilege -> privilege.getEntityType() == EntityType.Enrolment)
                            .forEach(enrolmentPrivilege -> {
                                GroupPrivilege groupPrivilege = new GroupPrivilege();
                                groupPrivilege.setGroup(currentGroup);
                                groupPrivilege.setPrivilege(enrolmentPrivilege);
                                groupPrivilege.setSubjectType(subjectType);
                                groupPrivilege.setProgram(program);
                                groupPrivilege.setAllow(false);
                                allPrivileges.add(groupPrivilege);
                            });

                    EncounterType encounterType = operationalFormMapping.getEncounterType();

                    privilegeList.stream()
                            .filter(privilege -> privilege.getEntityType() == EntityType.Encounter)
                            .forEach(encounterPrivilege -> {
                                GroupPrivilege groupPrivilege = new GroupPrivilege();
                                groupPrivilege.setGroup(currentGroup);
                                groupPrivilege.setPrivilege(encounterPrivilege);
                                groupPrivilege.setSubjectType(subjectType);
                                groupPrivilege.setProgram(program);
                                groupPrivilege.setProgramEncounterType(encounterType);
                                groupPrivilege.setAllow(false);
                                allPrivileges.add(groupPrivilege);
                            });
                } else {
                    privilegeList.stream()
                            .filter(privilege -> privilege.getEntityType() == EntityType.Encounter)
                            .forEach(encounterPrivilege -> {
                                GroupPrivilege groupPrivilege = new GroupPrivilege();
                                groupPrivilege.setGroup(currentGroup);
                                groupPrivilege.setPrivilege(encounterPrivilege);
                                groupPrivilege.setSubjectType(subjectType);
                                groupPrivilege.setEncounterType(operationalFormMapping.getEncounterType());
                                groupPrivilege.setAllow(false);
                                allPrivileges.add(groupPrivilege);
                            });
                }
            });

            checklistDetails.forEach(checklistDetail ->
                    privilegeList.stream()
                            .filter(privilege -> privilege.getEntityType() == EntityType.Checklist)
                            .forEach(privilege -> {
                                GroupPrivilege groupPrivilege = new GroupPrivilege();
                                groupPrivilege.setGroup(currentGroup);
                                groupPrivilege.setPrivilege(privilege);
                                groupPrivilege.setSubjectType(subjectType);
                                groupPrivilege.setChecklistDetail(checklistDetail);
                                allPrivileges.add(groupPrivilege);
                            })
            );
        });

        return allPrivileges;
    }
}
