package org.avni.healthmodule.adapter.contract.encounter;

import org.avni.domain.EncounterType;

public class EncounterTypeRuleInput {
    private EncounterType encounterType;

    public EncounterTypeRuleInput(EncounterType encounterType) {
        this.encounterType = encounterType;
    }

    public String getName() {
        return encounterType.getName();
    }
}
