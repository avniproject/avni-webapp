package org.openchs.web;

import org.openchs.dao.DashboardRepository;
import org.openchs.domain.Dashboard;
import org.openchs.service.DashboardService;
import org.openchs.web.request.DashboardContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
public class DashboardController {

    private final DashboardRepository dashboardRepository;
    private final DashboardService dashboardService;

    @Autowired
    public DashboardController(DashboardRepository dashboardRepository,
                               DashboardService dashboardService) {
        this.dashboardRepository = dashboardRepository;
        this.dashboardService = dashboardService;
    }

    @GetMapping(value = "/web/dashboard")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public List<DashboardContract> getAll() {
        return dashboardRepository.findAllByIsVoidedFalse()
                .stream().map(DashboardContract::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping(value = "/web/dashboard/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public ResponseEntity<DashboardContract> getById(@PathVariable Long id) {
        Optional<Dashboard> dashboard = dashboardRepository.findById(id);
        return dashboard.map(d -> ResponseEntity.ok(DashboardContract.fromEntity(d)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/web/dashboard")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    @Transactional
    public ResponseEntity<DashboardContract> newDashboard(@RequestBody DashboardContract dashboardContract) {
        Dashboard dashboard = dashboardService.saveDashboard(dashboardContract);
        return ResponseEntity.ok(DashboardContract.fromEntity(dashboard));
    }

    @PutMapping(value = "/web/dashboard/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    @Transactional
    public ResponseEntity<DashboardContract> editDashboard(@PathVariable Long id, @RequestBody DashboardContract dashboardContract) {
        Optional<Dashboard> dashboard = dashboardRepository.findById(id);
        if (!dashboard.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Dashboard newDashboard = dashboardService.editDashboard(dashboardContract, id);
        return ResponseEntity.ok(DashboardContract.fromEntity(newDashboard));
    }

    @DeleteMapping(value = "/web/dashboard/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    @Transactional
    public void deleteDashboard(@PathVariable Long id) {
        Optional<Dashboard> dashboard = dashboardRepository.findById(id);
        dashboard.ifPresent(dashboardService::deleteDashboard);
    }
}
