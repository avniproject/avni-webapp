package org.avni.server.web.request.common;

import org.avni.server.web.request.CHSRequest;
import org.joda.time.DateTime;

public class CommonAbstractEncounterRequest extends CHSRequest {
    private DateTime encounterDateTime;
    private String encounterTypeUUID;
    private String encounterType;

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
}
