package org.openchs.web.request;

import org.openchs.domain.AddressLevelType;

import java.util.ArrayList;
import java.util.List;

public class LocationContract extends ReferenceDataContract {
    private Double level;
    private List<LocationContract> parents;
    private AddressLevelType type;

    public Double getLevel() {
        return level;
    }

    public void setLevel(Double level) {
        this.level = level;
    }

    public AddressLevelType getType() {
        return type;
    }

    public void setType(AddressLevelType type) {
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
