package org.avni.server.web.request.rules.request;

import org.avni.server.web.request.rules.RulesContractWrapper.RuleServerEntityContract;

public class ScheduleRuleRequestEntity {
    private RuleServerEntityContract entity;
    private String scheduleRule;

    public ScheduleRuleRequestEntity(RuleServerEntityContract entity, String scheduleRule) {
        this.entity = entity;
        this.scheduleRule = scheduleRule;
    }

    public RuleServerEntityContract getEntity() {
        return entity;
    }

    public String getScheduleRule() {
        return scheduleRule;
    }
}
