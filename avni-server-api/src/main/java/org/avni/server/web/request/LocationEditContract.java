package org.avni.server.web.request;

public class LocationEditContract extends ReferenceDataContract {
    private String title;
    private Long parentId;
    private Long level;
    private Long typeId;


    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public Long getLevel() {
        return level;
    }

    public void setLevel(Long level) {
        this.level = level;
    }

    public Long getTypeId() {
        return typeId;
    }

    public void setTypeId(Long typeId) {
        this.typeId = typeId;
    }

    public LocationEditContract() {}

    public String getTitle() { return title; }

    public void setTitle(String title) { this.title = title; }
}
