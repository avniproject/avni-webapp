package org.openchs.web.request;

import org.joda.time.DateTime;
import org.openchs.web.request.common.CommonAbstractEncounterRequest;

public class EncounterContract extends CommonAbstractEncounterRequest {
    String name;
    String operationalEncounterTypeName;
    DateTime cancelDateTime;
    DateTime earliestVisitDateTime;
    DateTime maxVisitDateTime;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getOperationalEncounterTypeName() {
        return operationalEncounterTypeName;
    }

    public void setOperationalEncounterTypeName(String operationalEncounterTypeName) {
        this.operationalEncounterTypeName = operationalEncounterTypeName;
    }

    public DateTime getCancelDateTime() {
        return cancelDateTime;
    }

    public void setCancelDateTime(DateTime cancelDateTime) {
        this.cancelDateTime = cancelDateTime;
    }

    public DateTime getEarliestVisitDateTime() {
        return earliestVisitDateTime;
    }

    public void setEarliestVisitDateTime(DateTime earliestVisitDateTime) {
        this.earliestVisitDateTime = earliestVisitDateTime;
    }

    public DateTime getMaxVisitDateTime() {
        return maxVisitDateTime;
    }

    public void setMaxVisitDateTime(DateTime maxVisitDateTime) {
        this.maxVisitDateTime = maxVisitDateTime;
    }
}