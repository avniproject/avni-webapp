package org.avni.server.web.request;

import org.avni.server.domain.DashboardSectionCardMapping;

public class DashboardSectionCardMappingContract extends CHSRequest {

    private String dashboardSectionUUID;
    private String reportCardUUID;
    private Double displayOrder;

    public static DashboardSectionCardMappingContract fromEntity(DashboardSectionCardMapping mapping) {
        DashboardSectionCardMappingContract contract = new DashboardSectionCardMappingContract();
        contract.setUuid(mapping.getUuid());
        contract.setDashboardSectionUUID(mapping.getDashboardSection().getUuid());
        contract.setReportCardUUID(mapping.getCard().getUuid());
        contract.setDisplayOrder(mapping.getDisplayOrder());
        return contract;
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

    public void setDashboardSectionUUID(String dashboardSectionUUID) {
        this.dashboardSectionUUID = dashboardSectionUUID;
    }

    public String getDashboardSectionUUID() {
        return dashboardSectionUUID;
    }

    public String getReportCardUUID() {
        return reportCardUUID;
    }
}
