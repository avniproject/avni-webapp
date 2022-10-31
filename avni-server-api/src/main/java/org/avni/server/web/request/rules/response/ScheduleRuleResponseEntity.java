package org.avni.server.web.request.rules.response;

import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

public class ScheduleRuleResponseEntity extends BaseRuleResponseEntity {
    private DateTime scheduledDateTime;

    public DateTime getScheduledDateTime() {
        return scheduledDateTime;
    }

    public void setScheduledDateTime(String scheduledDateTimeString) {
        DateTimeFormatter formatter = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss");
        DateTime scheduledDateTime = formatter.parseDateTime(scheduledDateTimeString);
        this.scheduledDateTime = scheduledDateTime;
    }
}
