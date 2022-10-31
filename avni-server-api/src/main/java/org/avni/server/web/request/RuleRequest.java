package org.avni.server.web.request;

import org.avni.server.domain.RuledEntity;
import org.avni.server.domain.RuledEntityType;

import java.util.Map;

public class RuleRequest {
    private String ruleDependencyUUID;

    private RuledEntity entity;
    private String entityUUID;
    private String entityType;

    private String type;
    private Double executionOrder;

    private Map<String, String> data;

    private String name;

    private String uuid;
    private String fnName;

    public RuledEntity getEntity() {
        if (entity == null) {
            entity = new RuledEntity();
            entity.setUuid(entityUUID);
            entity.setType(entityType);
        }
        return entity;
    }

    public void setEntity(RuledEntity entity) {
        this.entity = entity;
    }

    public String getEntityUUID() {
        return getEntity().getUuid();
    }

    public void setEntityUUID(String entityUUID) {
        this.entityUUID = entityUUID;
    }

    public RuledEntityType getEntityType() {
        return getEntity().getType();
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Map<String, String> getData() {
        return data;
    }

    public void setData(Map<String, String> data) {
        this.data = data;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getFnName() {
        return fnName;
    }

    public void setFnName(String fnName) {
        this.fnName = fnName;
    }

    public String getRuleDependencyUUID() {
        return ruleDependencyUUID;
    }

    public void setRuleDependencyUUID(String ruleDependencyUUID) {
        this.ruleDependencyUUID = ruleDependencyUUID;
    }

    public Double getExecutionOrder() {
        return executionOrder;
    }

    public void setExecutionOrder(Double executionOrder) {
        this.executionOrder = executionOrder;
    }

}
