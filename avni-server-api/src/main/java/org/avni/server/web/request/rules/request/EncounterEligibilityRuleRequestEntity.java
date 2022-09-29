package org.avni.server.web.request.rules.request;

import org.avni.server.web.request.rules.RulesContractWrapper.IndividualContractWrapper;
import org.avni.server.web.request.EncounterTypeContract;

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
