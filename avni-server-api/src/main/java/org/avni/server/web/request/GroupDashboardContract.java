package org.avni.server.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.avni.server.domain.GroupDashboard;

@JsonInclude(JsonInclude.Include.NON_DEFAULT)
public class GroupDashboardContract extends CHSRequest {
    @JsonInclude(JsonInclude.Include.NON_DEFAULT)
    private boolean isPrimaryDashboard = false;
    private Long dashboardId;
    private Long groupId;
    private String dashboardName;
    private String dashboardDescription;

    public boolean isPrimaryDashboard() {
        return isPrimaryDashboard;
    }

    public void setPrimaryDashboard(boolean primaryDashboard) {
        isPrimaryDashboard = primaryDashboard;
    }

    public void setPrimaryDashboard(Boolean primaryDashboard) {
        isPrimaryDashboard = primaryDashboard;
    }

    public Long getDashboardId() {
        return dashboardId;
    }

    public void setDashboardId(Long dashboardId) {
        this.dashboardId = dashboardId;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public void setDashboardName(String dashboardName) {
        this.dashboardName = dashboardName;
    }

    public String getDashboardName() {
        return dashboardName;
    }

    public void setDashboardDescription(String dashboardDescription) {
        this.dashboardDescription = dashboardDescription;
    }

    public String getDashboardDescription() {
        return dashboardDescription;
    }

    public static GroupDashboardContract fromEntity(GroupDashboard groupDashboard) {
        GroupDashboardContract groupDashboardContract = new GroupDashboardContract();
        groupDashboardContract.setId(groupDashboard.getId());
        groupDashboardContract.setUuid(groupDashboard.getUuid());
        groupDashboardContract.setVoided(groupDashboard.isVoided());
        groupDashboardContract.setPrimaryDashboard(groupDashboard.isPrimaryDashboard());
        groupDashboardContract.setGroupId(groupDashboard.getGroup().getId());
        groupDashboardContract.setDashboardId(groupDashboard.getDashboard().getId());
        groupDashboardContract.setDashboardName(groupDashboard.getDashboard().getName());
        groupDashboardContract.setDashboardDescription(groupDashboard.getDashboard().getDescription());
        return groupDashboardContract;
    }
}
