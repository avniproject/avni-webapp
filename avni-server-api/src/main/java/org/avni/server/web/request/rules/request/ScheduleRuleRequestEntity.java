package org.avni.server.web.request.rules.request;

import org.avni.server.domain.Individual;
import org.avni.server.web.request.rules.RulesContractWrapper.RuleContract;

public class ScheduleRuleRequestEntity {
    private RuleContract entity;
    private String scheduleRule;

    public ScheduleRuleRequestEntity(RuleContract entity, String scheduleRule) {
        this.entity = entity;
        this.scheduleRule = scheduleRule;
    }

    public RuleContract getEntity() {
        return entity;
    }

    public String getScheduleRule() {
        return scheduleRule;
    }
}
