package org.avni.server.web.request;


public class AddressLevelContract extends ReferenceDataContract {
    private Integer level;
    private String type;

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
