package org.avni.server.web.request.rules.request;

import org.avni.server.domain.Individual;

public class ScheduleRuleRequestEntity {
    private Individual individual;
    private String scheduleRule;

    public ScheduleRuleRequestEntity(Individual individual, String scheduleRule) {
        this.individual = individual;
        this.scheduleRule = scheduleRule;
    }

    public Individual getIndividual() {
        return individual;
    }

    public String getScheduleRule() {
        return scheduleRule;
    }
}
