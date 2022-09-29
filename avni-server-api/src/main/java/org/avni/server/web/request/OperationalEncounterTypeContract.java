package org.avni.server.web.request;

import org.avni.server.domain.OperationalEncounterType;

public class OperationalEncounterTypeContract extends CHSRequest {
    private CHSRequest encounterType;
    private String name; /* operationalEncounterType's Name or in other words alias for a encounter type */

    public CHSRequest getEncounterType() {
        return encounterType;
    }

    public void setEncounterType(CHSRequest encounterType) {
        this.encounterType = encounterType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public static OperationalEncounterTypeContract fromOperationalEncounterType(
            OperationalEncounterType operationalEncounterType) {
        OperationalEncounterTypeContract contract = new OperationalEncounterTypeContract();
        contract.setUuid(operationalEncounterType.getUuid());
        contract.setName(operationalEncounterType.getName());
        contract.setEncounterType(new CHSRequest(operationalEncounterType.getEncounterTypeUUID()));
        contract.setVoided(operationalEncounterType.isVoided());
        return contract;
    }
}
