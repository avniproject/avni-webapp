package org.openchs.web.request;

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
}
