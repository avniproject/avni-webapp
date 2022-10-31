package org.avni.server.web.request.rules.RulesContractWrapper;

import org.joda.time.DateTime;
import org.joda.time.LocalDate;

public class VisitSchedule {
    String name;
    String uuid;
    String encounterType;
    DateTime earliestDate;
    DateTime maxDate;
    String visitCreationStrategy;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getEncounterType() {
        return encounterType;
    }

    public void setEncounterType(String encounterType) {
        this.encounterType = encounterType;
    }

    public DateTime getEarliestDate() {
        return earliestDate;
    }

    public void setEarliestDate(DateTime earliestDate) {
        this.earliestDate = earliestDate;
    }

    public DateTime getMaxDate() {
        return maxDate;
    }

    public void setMaxDate(DateTime maxDate) {
        this.maxDate = maxDate;
    }

    public String getVisitCreationStrategy() {
        return visitCreationStrategy;
    }

    public void setVisitCreationStrategy(String visitCreationStrategy) {
        this.visitCreationStrategy = visitCreationStrategy;
    }
}
