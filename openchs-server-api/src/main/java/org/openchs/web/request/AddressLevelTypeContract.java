package org.openchs.web.request;

public class AddressLevelTypeContract extends ReferenceDataContract {
    private Double level;
    private ReferenceDataContract parent;

    public Double getLevel() {
        return level;
    }

    public void setLevel(Double level) {
        this.level = level;
    }

    public ReferenceDataContract getParent() {
        return parent;
    }

    public void setParent(ReferenceDataContract parent) {
        this.parent = parent;
    }
}