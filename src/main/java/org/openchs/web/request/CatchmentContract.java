package org.openchs.web.request;

import java.util.List;

public class CatchmentContract extends ReferenceDataContract {
    private List<String> villages;

    public List<String> getVillages() {
        return villages;
    }

    public void setVillages(List<String> villages) {
        this.villages = villages;
    }

    @Override
    public String toString() {
        return String.format("UUID: %s, Name: %s", this.getUuid(), this.getName());
    }

}
