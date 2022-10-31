package org.avni.server.web.response;

public class ReportingViewResponse {

    private String viewName;
    private String viewDefinition;
    private boolean isLegacyView;

    public ReportingViewResponse(String viewName, boolean isLegacyView, String viewDefinition) {
        this.viewName = viewName;
        this.isLegacyView = isLegacyView;
        this.viewDefinition = viewDefinition;
    }

    public String getViewName() {
        return viewName;
    }

    public void setViewName(String viewName) {
        this.viewName = viewName;
    }

    public boolean isLegacyView() {
        return isLegacyView;
    }

    public void setLegacyView(boolean legacyView) {
        isLegacyView = legacyView;
    }

    public String getViewDefinition() {
        return viewDefinition;
    }

    public void setViewDefinition(String viewDefinition) {
        this.viewDefinition = viewDefinition;
    }
}
