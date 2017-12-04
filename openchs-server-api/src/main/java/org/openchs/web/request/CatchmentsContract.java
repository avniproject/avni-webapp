package org.openchs.web.request;

import java.util.List;

public class CatchmentsContract {
    private String organisation;
    private List<CatchmentContract> catchments;

    public String getOrganisation() {
        return organisation;
    }

    public void setOrganisation(String organisation) {
        this.organisation = organisation;
    }

    public List<CatchmentContract> getCatchments() {
        return catchments;
    }

    public void setCatchments(List<CatchmentContract> catchments) {
        this.catchments = catchments;
    }
}