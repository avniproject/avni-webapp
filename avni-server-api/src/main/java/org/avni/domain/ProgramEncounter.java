package org.avni.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.BatchSize;
import org.joda.time.DateTime;
import org.avni.application.projections.BaseProjection;
import org.avni.domain.EncounterType.EncounterTypeProjection;
import org.springframework.data.rest.core.config.Projection;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.Objects;

@Entity
@Table(name = "program_encounter")
@JsonIgnoreProperties({"programEnrolment"})
@BatchSize(size = 100)
public class ProgramEncounter extends AbstractEncounter {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_enrolment_id")
    private ProgramEnrolment programEnrolment;

    @Column(name= "individual_id")
    private Long individualId;

    public ProgramEnrolment getProgramEnrolment() {
        return programEnrolment;
    }

    public void setProgramEnrolment(ProgramEnrolment programEnrolment) {
        this.programEnrolment = programEnrolment;
    }

    @JsonIgnore
    public Long getIndividualId() {
        return individualId;
    }

    public void setIndividualId(Long individualId) {
        this.individualId = individualId;
    }

    @Projection(name = "ProgramEncounterProjectionMinimal", types = {ProgramEncounter.class})
    public interface ProgramEncounterProjectionMinimal extends BaseProjection {
        EncounterTypeProjection getEncounterType();

        String getName();

        DateTime getEncounterDateTime();

        DateTime getEarliestVisitDateTime();

        DateTime getMaxVisitDateTime();

        DateTime getCancelDateTime();
    }
}
