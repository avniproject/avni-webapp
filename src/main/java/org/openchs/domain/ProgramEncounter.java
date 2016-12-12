package org.openchs.domain;

import org.hibernate.annotations.Type;
import org.joda.time.DateTime;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "program_encounter")
public class ProgramEncounter extends CHSEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    @JoinColumn(name = "followup_type_id")
    private FollowupType followupType;

    @Column
    private DateTime scheduledDateTime;

    @Column
    private DateTime actualDateTime;

    @Column
    @Type(type = "observations")
    private ObservationCollection observations;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
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

    public ProgramEnrolment getProgramEnrolment() {
        return programEnrolment;
    }

    public void setProgramEnrolment(ProgramEnrolment programEnrolment) {
        this.programEnrolment = programEnrolment;
    }

    public ObservationCollection getObservations() {
        return observations;
    }

    public void setObservations(ObservationCollection observations) {
        this.observations = observations;
    }
}