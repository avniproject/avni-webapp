package org.avni.server.web.request;

import org.avni.server.domain.Dashboard;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class DashboardContract extends CHSRequest {

    private String name;
    private String description;
    private List<DashboardSectionContract> sections = new ArrayList<>();

    public static DashboardContract fromEntity(Dashboard dashboard) {
        DashboardContract dashboardContract = new DashboardContract();
        dashboardContract.setId(dashboard.getId());
        dashboardContract.setUuid(dashboard.getUuid());
        dashboardContract.setVoided(dashboard.isVoided());
        dashboardContract.setName(dashboard.getName());
        dashboardContract.setDescription(dashboard.getDescription());
        setSections(dashboardContract, dashboard);
        return dashboardContract;
    }

    private static void setSections(DashboardContract dashboardContract, Dashboard dashboard) {
        List<DashboardSectionContract> list = dashboard.getDashboardSections()
                .stream()
                .filter(it -> !it.isVoided())
                .map(DashboardSectionContract::fromEntity)
                .collect(Collectors.toList());
        dashboardContract.setSections(list);
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<DashboardSectionContract> getSections() {
        return sections;
    }

    public void setSections(List<DashboardSectionContract> sections) {
        this.sections = sections;
    }
}
