package org.avni.web.request.rules.request;

import org.avni.web.request.EncounterTypeContract;
import org.avni.web.request.rules.RulesContractWrapper.IndividualContractWrapper;

import java.util.List;

public class EncounterEligibilityRuleRequestEntity extends BaseRuleRequest {

    private IndividualContractWrapper individual;
    private List<EncounterTypeContract> encounterTypes;

    public EncounterEligibilityRuleRequestEntity(IndividualContractWrapper individual, List<EncounterTypeContract> encounterTypes) {
        this.individual = individual;
        this.encounterTypes = encounterTypes;
    }

    public IndividualContractWrapper getIndividual() {
        return individual;
    }

    public List<EncounterTypeContract> getEncounterTypes() {
        return encounterTypes;
    }
}
