package org.openchs.domain;

import org.hibernate.annotations.Type;
import org.joda.time.DateTime;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.Map;

@Entity
@Table(name = "program_encounter")
public class ProgramEncounter extends CHSEntity {
    @ManyToOne
    @NotNull
    @JoinColumn(name = "followup_type_id")
    private FollowupType followupType;

    @Column
    private DateTime scheduledDateTime;

    @Column
    private DateTime actualDateTime;

    @Column
    @Type(type = "KeyValuesJson")
    private Object observations;

    @ManyToOne
    @JoinColumn(name = "program_enrolment_id")
    private ProgramEnrolment programEnrolment;

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

    public Object getObservations() {
        return observations;
    }

    public ProgramEnrolment getProgramEnrolment() {
        return programEnrolment;
    }

    public void setProgramEnrolment(ProgramEnrolment programEnrolment) {
        this.programEnrolment = programEnrolment;
    }

    public void setObservations(Object observations) {
        this.observations = observations;
    }
}