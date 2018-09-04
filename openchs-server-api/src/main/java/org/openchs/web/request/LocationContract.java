package org.openchs.web.request;

import java.util.ArrayList;
import java.util.List;

public class LocationContract extends ReferenceDataContract {
    private Double level;
    private List<LocationContract> parents;
    private String type;

    public Double getLevel() {
        return level;
    }

    public void setLevel(Double level) {
        this.level = level;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<LocationContract> getParents() {
        if (parents == null) {
            return parents = new ArrayList<>();
        }
        return parents;
    }

    public void setParents(List<LocationContract> parents) {
        this.parents = parents;
    }
}
