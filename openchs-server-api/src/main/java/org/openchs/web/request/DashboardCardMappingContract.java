package org.openchs.web.request;

import org.openchs.domain.DashboardCardMapping;

public class DashboardCardMappingContract extends CHSRequest{

    private String dashboardUUID;
    private String reportCardUUID;
    private Double displayOrder;

    public static DashboardCardMappingContract fromEntity(DashboardCardMapping dashboardCardMapping){
        DashboardCardMappingContract dashboardCardMappingContract = new DashboardCardMappingContract();
        dashboardCardMappingContract.setUuid(dashboardCardMapping.getUuid());
        dashboardCardMappingContract.setDashboardUUID(dashboardCardMapping.getDashboardUUID());
        dashboardCardMappingContract.setReportCardUUID(dashboardCardMapping.getCardUUID());
        dashboardCardMappingContract.setDisplayOrder(dashboardCardMapping.getDisplayOrder());
        return dashboardCardMappingContract;
    }

    public String getDashboardUUID() {
        return dashboardUUID;
    }

    public void setDashboardUUID(String dashboardUUID) {
        this.dashboardUUID = dashboardUUID;
    }

    public String getReportCardUUID() {
        return reportCardUUID;
    }

    public void setReportCardUUID(String reportCardUUID) {
        this.reportCardUUID = reportCardUUID;
    }

    public Double getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Double displayOrder) {
        this.displayOrder = displayOrder;
    }
}
