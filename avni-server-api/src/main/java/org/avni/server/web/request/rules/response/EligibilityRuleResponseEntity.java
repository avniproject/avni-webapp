package org.avni.server.web.request.rules.response;

import java.util.List;

public class EligibilityRuleResponseEntity extends BaseRuleResponseEntity {
    private List<EligibilityRuleEntity> eligibilityRuleEntities;

    public List<EligibilityRuleEntity> getEligibilityRuleEntities() {
        return eligibilityRuleEntities;
    }

    public void setEligibilityRuleEntities(List<EligibilityRuleEntity> eligibilityRuleEntities) {
        this.eligibilityRuleEntities = eligibilityRuleEntities;
    }
}
