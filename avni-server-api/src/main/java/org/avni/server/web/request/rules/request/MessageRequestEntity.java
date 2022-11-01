package org.avni.server.web.request.rules.request;

import org.avni.server.web.request.rules.RulesContractWrapper.RuleServerEntityContract;

public class MessageRequestEntity {
    private RuleServerEntityContract entity;
    private String entityType;
    private String rule;

    public MessageRequestEntity(RuleServerEntityContract entity, String rule, String entityType) {
        this.entity = entity;
        this.rule = rule;
        this.entityType = entityType;
    }

    public RuleServerEntityContract getEntity() {
        return entity;
    }

    public String getRule() {
        return rule;
    }

    public String getEntityType() {
        return entityType;
    }
}
