package org.openchs.domain;

import org.hibernate.annotations.Type;
import org.joda.time.DateTime;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.List;

@Entity
@Table(name = "individual_program_summary")
public class IndividualProgramSummary extends CHSEntity {
    @Column
    @NotNull
    private DateTime enrolmentDateTime;

    @ManyToOne
    private ProgramOutcome programOutcome;

    @ManyToOne
    @NotNull
    private Program program;

    @Column
    @Type(type = "ProgramEncountersJson")
    private List<ProgramEncounter> encounters;
}