package org.openchs.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.joda.time.DateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProgramEncounterRequest extends AbstractEncounterRequest {
    private String programEnrolmentUUID;
    private String name;
    private DateTime scheduledDateTime;
    private DateTime maxDateTime;

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

    public DateTime getScheduledDateTime() {
        return scheduledDateTime;
    }

    public void setScheduledDateTime(DateTime scheduledDateTime) {
        this.scheduledDateTime = scheduledDateTime;
    }

    public DateTime getMaxDateTime() {
        return maxDateTime;
    }

    public void setMaxDateTime(DateTime maxDateTime) {
        this.maxDateTime = maxDateTime;
    }
}