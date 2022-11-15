package org.avni.server.web.request.rules.request;

import org.avni.server.web.request.rules.RulesContractWrapper.IndividualContract;
import org.avni.server.web.request.EntityTypeContract;

import java.util.List;

public class EntityEligibilityRuleRequest extends BaseRuleRequest {

    private IndividualContract individual;
    private List<EntityTypeContract> entityTypes;
    private String ruleEntityType;

    public EntityEligibilityRuleRequest(IndividualContract individual, List<EntityTypeContract> entityTypes, String ruleEntityType) {
        this.individual = individual;
        this.entityTypes = entityTypes;
        this.ruleEntityType = ruleEntityType;
    }

    public IndividualContract getIndividual() {
        return individual;
    }

    public List<EntityTypeContract> getEntityTypes() {
        return entityTypes;
    }

    public String getRuleEntityType() {
        return ruleEntityType;
    }
}
