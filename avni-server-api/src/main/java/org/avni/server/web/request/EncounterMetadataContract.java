package org.avni.server.web.request;

public class EncounterMetadataContract {
    Long dueEncounters;
    Long overdueEncounters;

    public Long getDueEncounters() {
        return dueEncounters;
    }

    public void setDueEncounters(Long dueEncounters) {
        this.dueEncounters = dueEncounters;
    }

    public Long getOverdueEncounters() {
        return overdueEncounters;
    }

    public void setOverdueEncounters(Long overdueEncounters) {
        this.overdueEncounters = overdueEncounters;
    }
}
