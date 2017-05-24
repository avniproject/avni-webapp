package org.openchs.web.request.keyvalue;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.joda.time.DateTime;
import org.openchs.web.request.AbstractEncounterRequest;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class KeyValueProgramEncounterRequest extends KeyValueAbstractEncounterRequest {
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