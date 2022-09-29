package org.avni.server.web.request;

import java.util.List;

public class CatchmentsContract {

    private List<CatchmentContract> catchments;

    public List<CatchmentContract> getCatchments() {
        return catchments;
    }

    public void setCatchments(List<CatchmentContract> catchments) {
        this.catchments = catchments;
    }
}
