package org.avni.server.web;

import org.avni.server.dao.GroupRepository;
import org.avni.server.domain.Group;
import org.avni.server.domain.Organisation;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.service.GroupsService;
import org.avni.server.web.request.GroupContract;
import org.avni.server.web.request.webapp.ProgramContractWeb;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;

@RestController
public class GroupsController implements RestControllerResourceProcessor<ProgramContractWeb> {

    private GroupRepository groupRepository;
    private GroupsService groupsService;

    public GroupsController(GroupRepository groupRepository, GroupsService groupsService) {
        this.groupRepository = groupRepository;
        this.groupsService = groupsService;
    }

    @GetMapping(value = "/web/groups")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public List<Group> getAll() {
        return groupRepository.findAllByIsVoidedFalse();
    }

    @PostMapping(value = "web/groups")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @Transactional
    public ResponseEntity saveProgramForWeb(@RequestBody GroupContract group) {
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        if (group.getName() == null || group.getName().trim().equals("")) {
            return ResponseEntity.badRequest().body("Group name cannot be blank.");
        }
        if (groupRepository.findByNameAndOrganisationId(group.getName(), organisation.getId()) != null) {
            return ResponseEntity.badRequest().body(String.format("Group with name %s already exists.", group.getName()));
        }
        Group savedGroup = groupsService.saveGroup(group);
        return ResponseEntity.ok(savedGroup);
    }

    @PutMapping(value = "web/group")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @Transactional
    public ResponseEntity updateGroup(@RequestBody Group updatedGroup) {
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        Group group = groupRepository.findByIdAndOrganisationId(updatedGroup.getId(), organisation.getId());
        if (group == null) {
            return ResponseEntity.badRequest().body(String.format("Group with id %s not found.", updatedGroup.getId()));
        }

        if (!updatedGroup.getName().equals(group.getName()) && !group.getName().equals("Everyone")) {
            group.setName(updatedGroup.getName());
        }

        if (updatedGroup.isHasAllPrivileges() != group.isHasAllPrivileges()) {
            group.setHasAllPrivileges(updatedGroup.isHasAllPrivileges());
        }

        return ResponseEntity.ok(groupRepository.save(group));
    }

    @DeleteMapping(value = "/groups/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @Transactional
    public ResponseEntity voidGroup(@PathVariable("id") Long id) {
        Group group = groupRepository.findOne(id);
        if (group == null)
            return ResponseEntity.badRequest().body(String.format("Group with id '%d' not found", id));
        group.setVoided(true);
        group.updateAudit();
        groupRepository.save(group);
        return ResponseEntity.ok(null);
    }
}
