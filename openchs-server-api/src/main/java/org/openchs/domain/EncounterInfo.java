package org.openchs.domain;

import org.joda.time.DateTime;

public class EncounterInfo {

    public EncounterInfo(Encounter encounter) {
        this.encounterDateTime = encounter.getEncounterDateTime();
        this.encounterType = encounter.getEncounterType();
    }

    public DateTime getEncounterDateTime() {
        return encounterDateTime;
    }

    public void setEncounterDateTime(DateTime encounterDateTime) {
        this.encounterDateTime = encounterDateTime;
    }

    public EncounterType getEncounterType() {
        return encounterType;
    }

    public void setEncounterType(EncounterType encounterType) {
        this.encounterType = encounterType;
    }

    private DateTime encounterDateTime;
    private EncounterType encounterType;

}
