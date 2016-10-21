package org.openchs.domain;

import org.joda.time.DateTime;

import java.util.Map;

public class ProgramEncounter {
    private FollowupType followupType;
    private DateTime scheduledDateTime;
    private DateTime actualDateTime;
    private Map<String, Object> observations;

    public FollowupType getFollowupType() {
        return followupType;
    }

    public void setFollowupType(FollowupType followupType) {
        this.followupType = followupType;
    }

    public DateTime getScheduledDateTime() {
        return scheduledDateTime;
    }

    public void setScheduledDateTime(DateTime scheduledDateTime) {
        this.scheduledDateTime = scheduledDateTime;
    }

    public DateTime getActualDateTime() {
        return actualDateTime;
    }

    public void setActualDateTime(DateTime actualDateTime) {
        this.actualDateTime = actualDateTime;
    }

    public Map<String, Object> getObservations() {
        return observations;
    }

    public void setObservations(Map<String, Object> observations) {
        this.observations = observations;
    }
}