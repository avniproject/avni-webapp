package org.openchs.web.request.common;

import org.joda.time.DateTime;
import org.openchs.web.request.CHSRequest;

public class CommonAbstractEncounterRequest extends CHSRequest {
    private DateTime encounterDateTime;
    private String encounterTypeUUID;
    private String encounterType;
    private boolean isVoided = false;

    public DateTime getEncounterDateTime() {
        return encounterDateTime;
    }

    public void setEncounterDateTime(DateTime encounterDateTime) {
        this.encounterDateTime = encounterDateTime;
    }

    public String getEncounterTypeUUID() {
        return encounterTypeUUID;
    }

    public void setEncounterTypeUUID(String encounterTypeUUID) {
        this.encounterTypeUUID = encounterTypeUUID;
    }

    public String getEncounterType() {
        return encounterType;
    }

    public void setEncounterType(String encounterType) {
        this.encounterType = encounterType;
    }

    public boolean isVoided() {
        return isVoided;
    }

    public void setVoided(boolean isVoided) {
        this.isVoided = isVoided;
    }
}