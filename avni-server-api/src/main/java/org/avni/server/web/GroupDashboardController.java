package org.avni.server.web;

import org.avni.server.dao.DashboardRepository;
import org.avni.server.dao.GroupDashboardRepository;
import org.avni.server.dao.GroupRepository;
import org.avni.server.domain.Dashboard;
import org.avni.server.domain.Group;
import org.avni.server.domain.GroupDashboard;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.service.GroupDashboardService;
import org.avni.server.web.request.GroupDashboardContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
public class GroupDashboardController {

    private final GroupDashboardRepository groupDashboardRepository;
    private final GroupDashboardService groupDashboardService;
    private final DashboardRepository dashboardRepository;
    private final GroupRepository groupRepository;

    @Autowired
    public GroupDashboardController(GroupDashboardRepository groupDashboardRepository,
                                    GroupDashboardService groupDashboardService, DashboardRepository dashboardRepository, GroupRepository groupRepository) {
        this.groupDashboardRepository = groupDashboardRepository;
        this.groupDashboardService = groupDashboardService;
        this.dashboardRepository = dashboardRepository;
        this.groupRepository = groupRepository;
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
    public ResponseEntity addUsersToGroup(@RequestBody List<GroupDashboardContract> request) {
        List<GroupDashboard> groupDashboards = new ArrayList<>();

        for (GroupDashboardContract contract : request) {
            Dashboard dashboard = dashboardRepository.findOne(contract.getDashboardId());
            Group group = groupRepository.findOne(contract.getGroupId());
            if (dashboard == null || group == null) {
                return ResponseEntity.badRequest().body(String.format("Invalid dashboard id %d or group id %d", contract.getDashboardId(), contract.getGroupId()));
            }

            GroupDashboard groupDashboard = new GroupDashboard();
            groupDashboard.setDashboard(dashboard);
            groupDashboard.setGroup(group);
            groupDashboard.assignUUID();
            groupDashboard.setOrganisationId(UserContextHolder.getUserContext().getOrganisationId());
            groupDashboards.add(groupDashboard);
        }

        return ResponseEntity.ok(groupDashboardRepository.saveAll(groupDashboards));
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

    @RequestMapping(value = "/groups/{id}/dashboards", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    public List<GroupDashboardContract> getDashboardsByGroupId(@PathVariable("id") Long id) {
        return groupDashboardRepository.findByGroup_IdAndIsVoidedFalse(id).stream()
                .map(GroupDashboardContract::fromEntity)
                .collect(Collectors.toList());
    }
}
