package org.openchs.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.joda.time.DateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProgramEncounterRequest extends AbstractEncounterRequest {
    private String programEnrolmentUUID;
    private String name;
    private DateTime maxDateTime;
    private DateTime earliestVisitDateTime;
    private DateTime maxVisitDateTime;

    public String getProgramEnrolmentUUID() {
        return programEnrolmentUUID;
    }

    public void setProgramEnrolmentUUID(String programEnrolmentUUID) {
        this.programEnrolmentUUID = programEnrolmentUUID;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public DateTime getMaxDateTime() {
        return maxDateTime;
    }

    public void setMaxDateTime(DateTime maxDateTime) {
        this.maxDateTime = maxDateTime;
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