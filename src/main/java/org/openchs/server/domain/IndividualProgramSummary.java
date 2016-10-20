package org.openchs.server.domain;

import org.hibernate.annotations.Type;
import org.joda.time.DateTime;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.List;

@Entity
@Table(name = "IndividualProgramSummary")
public class IndividualProgramSummary extends CHSEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

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