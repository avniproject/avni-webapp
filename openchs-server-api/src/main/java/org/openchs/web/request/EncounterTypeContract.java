package org.openchs.web.request;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import org.openchs.domain.EncounterType;

@JsonPropertyOrder({"name", "uuid"})
public class EncounterTypeContract extends ReferenceDataContract {

    public static EncounterTypeContract fromEncounterType(EncounterType encounterType) {
        EncounterTypeContract contract = new EncounterTypeContract();
        contract.setName(encounterType.getName());
        contract.setUuid(encounterType.getUuid());
        contract.setVoided(encounterType.isVoided());
        return contract;
    }
}
