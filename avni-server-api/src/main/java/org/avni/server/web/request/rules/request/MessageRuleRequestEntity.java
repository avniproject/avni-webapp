package org.avni.server.web.request.rules.request;

import org.avni.server.web.request.rules.RulesContractWrapper.RuleServerEntityContract;

public class MessageRuleRequestEntity {
    private RuleServerEntityContract entity;
    private String messageRule;

    public MessageRuleRequestEntity(RuleServerEntityContract entity, String messageRule) {
        this.entity = entity;
        this.messageRule = messageRule;
    }

    public RuleServerEntityContract getEntity() {
        return entity;
    }

    public String getMessageRule() {
        return messageRule;
    }
}
