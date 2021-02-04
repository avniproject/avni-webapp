package org.openchs.web;

import org.openchs.dao.GroupDashboardRepository;
import org.openchs.domain.GroupDashboard;
import org.openchs.service.GroupDashboardService;
import org.openchs.web.request.GroupDashboardContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
public class GroupDashboardController {

    private final GroupDashboardRepository groupDashboardRepository;
    private final GroupDashboardService groupDashboardService;

    @Autowired
    public GroupDashboardController(GroupDashboardRepository groupDashboardRepository,
                                    GroupDashboardService groupDashboardService) {
        this.groupDashboardRepository = groupDashboardRepository;
        this.groupDashboardService = groupDashboardService;
    }

    @GetMapping(value = "/web/groupDashboard")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public List<GroupDashboardContract> getAll() {
        return groupDashboardRepository.findAllByIsVoidedFalse()
                .stream().map(GroupDashboardContract::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping(value = "/web/groupDashboard/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public ResponseEntity<GroupDashboardContract> getById(@PathVariable Long id) {
        Optional<GroupDashboard> groupDashboard = groupDashboardRepository.findById(id);
        return groupDashboard.map(d -> ResponseEntity.ok(GroupDashboardContract.fromEntity(d)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/web/groupDashboard")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    @Transactional
    public ResponseEntity<GroupDashboardContract> newGroupDashboard(@RequestBody GroupDashboardContract groupDashboardContract) {
        GroupDashboard groupDashboard = groupDashboardService.save(groupDashboardContract);
        return ResponseEntity.ok(GroupDashboardContract.fromEntity(groupDashboard));
    }

    @PutMapping(value = "/web/groupDashboard/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    @Transactional
    public ResponseEntity<GroupDashboardContract> editGroupDashboard(@PathVariable Long id, @RequestBody GroupDashboardContract groupDashboardContract) {
        Optional<GroupDashboard> groupDashboard = groupDashboardRepository.findById(id);
        if (!groupDashboard.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        GroupDashboard newGroupDashboard = groupDashboardService.edit(groupDashboardContract, id);
        return ResponseEntity.ok(GroupDashboardContract.fromEntity(newGroupDashboard));
    }

    @DeleteMapping(value = "/web/groupDashboard/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    @Transactional
    public void deleteGroupDashboard(@PathVariable Long id) {
        Optional<GroupDashboard> groupDashboard = groupDashboardRepository.findById(id);
        groupDashboard.ifPresent(groupDashboardService::delete);
    }
}
