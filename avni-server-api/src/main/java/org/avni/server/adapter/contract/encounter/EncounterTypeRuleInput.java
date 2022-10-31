package org.avni.server.adapter.contract.encounter;

import org.avni.server.domain.EncounterType;

public class EncounterTypeRuleInput {
    private EncounterType encounterType;

    public EncounterTypeRuleInput(EncounterType encounterType) {
        this.encounterType = encounterType;
    }

    public String getName() {
        return encounterType.getName();
    }
}
