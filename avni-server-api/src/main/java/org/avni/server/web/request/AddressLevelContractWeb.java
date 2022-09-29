package org.avni.server.web.request;

import org.avni.server.application.projections.LocationProjection;
import org.avni.server.domain.AddressLevel;

public class AddressLevelContractWeb {

    private Long id;
    private String name;
    private String type;
    private Long typeId;
    private Double level;
    private String lineage;
    private String titleLineage;
    private Long parentId;
    private String uuid;

    public static AddressLevelContractWeb fromEntity(AddressLevel addressLevel) {
        AddressLevelContractWeb addressLevelContractWeb = new AddressLevelContractWeb();
        addressLevelContractWeb.setId(addressLevel.getId());
        addressLevelContractWeb.setName(addressLevel.getTitle());
        addressLevelContractWeb.setType(addressLevel.getType().getName());
        addressLevelContractWeb.setTypeId(addressLevel.getType().getId());
        addressLevelContractWeb.setLevel(addressLevel.getLevel());
        addressLevelContractWeb.setParentId(addressLevel.getParentId());
        addressLevelContractWeb.setLineage(addressLevel.getLineage());
        addressLevelContractWeb.setUuid(addressLevel.getUuid());
        return addressLevelContractWeb;
    }

    public static AddressLevelContractWeb fromEntity(LocationProjection locationProjection) {
        AddressLevelContractWeb addressLevelContractWeb = new AddressLevelContractWeb();
        addressLevelContractWeb.setId(locationProjection.getId());
        addressLevelContractWeb.setName(locationProjection.getTitle());
        addressLevelContractWeb.setType(locationProjection.getTypeString());
        addressLevelContractWeb.setTypeId(locationProjection.getTypeId());
        addressLevelContractWeb.setLevel(locationProjection.getLevel());
        addressLevelContractWeb.setParentId(locationProjection.getParentId());
        addressLevelContractWeb.setLineage(locationProjection.getLineage());
        addressLevelContractWeb.setTitleLineage(locationProjection.getTitleLineage());
        addressLevelContractWeb.setUuid(locationProjection.getUuid());
        return addressLevelContractWeb;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Double getLevel() {
        return level;
    }

    public void setLevel(Double level) {
        this.level = level;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public String getLineage() {
        return lineage;
    }

    public String getTitleLineage() {
        return titleLineage;
    }

    public void setLineage(String lineage) {
        this.lineage = lineage;
    }

    public void setTitleLineage(String titleLineage) {
        this.titleLineage = titleLineage;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public Long getTypeId() {
        return typeId;
    }

    public void setTypeId(Long typeId) {
        this.typeId = typeId;
    }
}
