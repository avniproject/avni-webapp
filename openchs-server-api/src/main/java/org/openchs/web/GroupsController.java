package org.openchs.web;

import org.openchs.dao.GroupRepository;
import org.openchs.dao.UserRepository;
import org.openchs.domain.Group;
import org.openchs.domain.Organisation;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.web.request.webapp.ProgramContractWeb;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import javax.transaction.Transactional;
import java.util.List;
import java.util.UUID;

@RestController
public class GroupsController implements RestControllerResourceProcessor<ProgramContractWeb> {

    private GroupRepository groupRepository;
    private UserRepository userRepository;

    public GroupsController(GroupRepository groupRepository, UserRepository userRepository) {
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
    }

    @GetMapping(value = "/web/groups")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public List<Group> getAll() {
        return groupRepository.findAll();
    }

    @PostMapping(value = "web/groups")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @Transactional
    public ResponseEntity saveProgramForWeb(@RequestBody Group group) {
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        group.setOrganisationId(organisation.getId());
        group.setUuid(UUID.randomUUID().toString());
        return ResponseEntity.ok(groupRepository.save(group));
    }

}
