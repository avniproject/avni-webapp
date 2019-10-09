package org.openchs.web.request.webapp;

import java.util.List;

public class CatchmentsExport {
    private String organisation;
    private List<CatchmentExport> catchments;

    public String getOrganisation() {
        return organisation;
    }

    public void setOrganisation(String organisation) {
        this.organisation = organisation;
    }

    public List<CatchmentExport> getCatchments() {
        return catchments;
    }

    public void setCatchments(List<CatchmentExport> catchments) {
        this.catchments = catchments;
    }
}