package org.openchs.web.request;

import org.openchs.application.KeyValues;

public class AddressLevelContract extends ReferenceDataContract {
    private Integer level;
    private KeyValues attributes;

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public KeyValues getAttributes() {
        return attributes;
    }

    public void setAttributes(KeyValues attributes) {
        this.attributes = attributes;
    }
}
