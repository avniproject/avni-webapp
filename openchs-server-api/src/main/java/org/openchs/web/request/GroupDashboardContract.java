package org.openchs.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.openchs.domain.GroupDashboard;

@JsonInclude(JsonInclude.Include.NON_DEFAULT)
public class GroupDashboardContract extends CHSRequest {
    @JsonInclude(JsonInclude.Include.NON_DEFAULT)
    private boolean isPrimaryDashboard = false;
    private String dashboardUUID;
    private String groupUUID;

    public boolean isPrimaryDashboard() {
        return isPrimaryDashboard;
    }

    public void setPrimaryDashboard(boolean primaryDashboard) {
        isPrimaryDashboard = primaryDashboard;
    }

    public void setPrimaryDashboard(Boolean primaryDashboard) {
        isPrimaryDashboard = primaryDashboard;
    }

    public String getDashboardUUID() {
        return dashboardUUID;
    }

    public void setDashboardUUID(String dashboardUUID) {
        this.dashboardUUID = dashboardUUID;
    }

    public String getGroupUUID() {
        return groupUUID;
    }

    public void setGroupUUID(String groupUUID) {
        this.groupUUID = groupUUID;
    }

    public static GroupDashboardContract fromEntity(GroupDashboard groupDashboard) {
        GroupDashboardContract groupDashboardContract = new GroupDashboardContract();
        groupDashboardContract.setId(groupDashboard.getId());
        groupDashboardContract.setUuid(groupDashboard.getUuid());
        groupDashboardContract.setVoided(groupDashboard.isVoided());
        groupDashboardContract.setPrimaryDashboard(groupDashboard.isPrimaryDashboard());
        groupDashboardContract.setGroupUUID(groupDashboard.getGroup().getUuid());
        groupDashboardContract.setDashboardUUID(groupDashboard.getDashboard().getUuid());
        return groupDashboardContract;
    }
}
