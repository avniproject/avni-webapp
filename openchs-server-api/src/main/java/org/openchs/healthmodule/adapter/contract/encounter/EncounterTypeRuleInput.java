package org.openchs.healthmodule.adapter.contract.encounter;

import org.openchs.domain.EncounterType;

public class EncounterTypeRuleInput {
    private EncounterType encounterType;

    public EncounterTypeRuleInput(EncounterType encounterType) {
        this.encounterType = encounterType;
    }

    public String getName() {
        return encounterType.getName();
    }
}