package org.avni.server.web.request;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import org.avni.server.domain.DeclarativeRule;
import org.avni.server.domain.EncounterType;

@JsonPropertyOrder({"name", "uuid"})
public class EncounterTypeContract extends ReferenceDataContract {

    private String encounterEligibilityCheckRule;
    private Boolean active;
    private DeclarativeRule encounterEligibilityCheckDeclarativeRule;

    public static EncounterTypeContract fromEncounterType(EncounterType encounterType) {
        EncounterTypeContract contract = new EncounterTypeContract();
        contract.setName(encounterType.getName());
        contract.setUuid(encounterType.getUuid());
        contract.setEncounterEligibilityCheckRule(encounterType.getEncounterEligibilityCheckRule());
        contract.setVoided(encounterType.isVoided());
        contract.setActive(encounterType.getActive());
        contract.setEncounterEligibilityCheckDeclarativeRule(encounterType.getEncounterEligibilityCheckDeclarativeRule());
        return contract;
    }

    public String getEncounterEligibilityCheckRule() {
        return encounterEligibilityCheckRule;
    }

    public void setEncounterEligibilityCheckRule(String encounterEligibilityCheckRule) {
        this.encounterEligibilityCheckRule = encounterEligibilityCheckRule;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public DeclarativeRule getEncounterEligibilityCheckDeclarativeRule() {
        return encounterEligibilityCheckDeclarativeRule;
    }

    public void setEncounterEligibilityCheckDeclarativeRule(DeclarativeRule encounterEligibilityCheckDeclarativeRule) {
        this.encounterEligibilityCheckDeclarativeRule = encounterEligibilityCheckDeclarativeRule;
    }
}
