package org.openchs.web.response;

public class ReportingViewResponse {

    private String viewName;
    private boolean isLegacyView;

    public ReportingViewResponse(String viewName, boolean isLegacyView) {
        this.viewName = viewName;
        this.isLegacyView = isLegacyView;
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
}
