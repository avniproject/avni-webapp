package org.openchs.web;

import org.openchs.dao.*;
import org.openchs.domain.*;
import org.openchs.service.GroupPrivilegeService;
import org.openchs.web.request.GroupPrivilegeContract;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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
    private GroupPrivilegeService groupPrivilegeService;

    public GroupPrivilegeController(GroupPrivilegeRepository groupPrivilegeRepository, GroupRepository groupRepository, PrivilegeRepository privilegeRepository, SubjectTypeRepository subjectTypeRepository, ProgramRepository programRepository, EncounterTypeRepository encounterTypeRepository, ChecklistDetailRepository checklistDetailRepository, GroupPrivilegeService groupPrivilegeService) {
        this.groupPrivilegeRepository = groupPrivilegeRepository;
        this.groupRepository = groupRepository;
        this.privilegeRepository = privilegeRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.programRepository = programRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.checklistDetailRepository = checklistDetailRepository;
        this.groupPrivilegeService = groupPrivilegeService;
    }

    @RequestMapping(value = "/groups/{id}/privileges", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    public List<GroupPrivilegeContract> getById(@PathVariable("id") Long id) {
        List<GroupPrivilege> groupPrivileges = groupPrivilegeRepository.findByGroup_Id(id);

        GroupPrivilege everythingAllowedPrivilege = groupPrivileges.stream()
                .filter(groupPrivilege -> groupPrivilege.getPrivilege().getEntityType() == EntityType.Everything && groupPrivilege.isAllow())
                .findAny().orElse(null);

        if (everythingAllowedPrivilege == null) {
            List<GroupPrivilege> allPrivileges = groupPrivilegeService.getAllGroupPrivileges(id);
            groupPrivileges.addAll(allPrivileges);
        }

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

                SubjectType subjectType = null;
                if (groupPrivilege.getSubjectTypeId().isPresent()) {
                    subjectType = subjectTypeRepository.findOne(groupPrivilege.getSubjectTypeId().get());
                }

                if (!optionalPrivilege.isPresent() || group == null) {
                    return ResponseEntity.badRequest().body(String.format("Invalid privilege id %d or group id %d", groupPrivilege.getPrivilegeId(), groupPrivilege.getGroupId()));
                }

                GroupPrivilege newGroupPrivilege = new GroupPrivilege();
                newGroupPrivilege.assignUUID();
                newGroupPrivilege.setPrivilege(optionalPrivilege.get());
                newGroupPrivilege.setGroup(group);
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

}
