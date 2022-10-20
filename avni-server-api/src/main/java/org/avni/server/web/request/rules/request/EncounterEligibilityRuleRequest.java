package org.avni.server.web.request.rules.request;

import org.avni.server.web.request.rules.RulesContractWrapper.IndividualContract;
import org.avni.server.web.request.EncounterTypeContract;

import java.util.List;

public class EncounterEligibilityRuleRequest extends BaseRuleRequest {

    private IndividualContract individual;
    private List<EncounterTypeContract> encounterTypes;

    public EncounterEligibilityRuleRequest(IndividualContract individual, List<EncounterTypeContract> encounterTypes) {
        this.individual = individual;
        this.encounterTypes = encounterTypes;
    }

    public IndividualContract getIndividual() {
        return individual;
    }

    public List<EncounterTypeContract> getEncounterTypes() {
        return encounterTypes;
    }
}
