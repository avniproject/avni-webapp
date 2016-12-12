package org.openchs.domain;

import org.hibernate.annotations.Type;
import org.joda.time.DateTime;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.Set;

@Entity
@Table(name = "program_enrolment")
public class ProgramEnrolment extends CHSEntity {
    @NotNull
    @ManyToOne(fetch= FetchType.LAZY)
    @JoinColumn(name="program_id")
    private Program program;

    @NotNull
    @ManyToOne(fetch= FetchType.LAZY)
    @JoinColumn(name="individual_id")
    private Individual individual;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProgramEncounter> programEncounters;

    @Column
    @NotNull
    private DateTime enrolmentDateTime;

    @Column
    @Type(type = "observations")
    private ObservationCollection enrolmentProfile;

    @ManyToOne(fetch= FetchType.LAZY)
    @JoinColumn(name = "program_outcome_id")
    private ProgramOutcome programOutcome;

    @Column
    @NotNull
    private DateTime programExitDateTime;

    @Column
    @Type(type = "observations")
    private ObservationCollection programExitObservations;

    public Program getProgram() {
        return program;
    }

    public void setProgram(Program program) {
        this.program = program;
    }

    public Individual getIndividual() {
        return individual;
    }

    public void setIndividual(Individual individual) {
        this.individual = individual;
    }

    public Set<ProgramEncounter> getProgramEncounters() {
        return programEncounters;
    }

    public void setProgramEncounters(Set<ProgramEncounter> programEncounters) {
        this.programEncounters = programEncounters;
    }

    public DateTime getEnrolmentDateTime() {
        return enrolmentDateTime;
    }

    public void setEnrolmentDateTime(DateTime enrolmentDateTime) {
        this.enrolmentDateTime = enrolmentDateTime;
    }

    public ObservationCollection getEnrolmentProfile() {
        return enrolmentProfile;
    }

    public void setEnrolmentProfile(ObservationCollection enrolmentProfile) {
        this.enrolmentProfile = enrolmentProfile;
    }

    public ProgramOutcome getProgramOutcome() {
        return programOutcome;
    }

    public void setProgramOutcome(ProgramOutcome programOutcome) {
        this.programOutcome = programOutcome;
    }

    public DateTime getProgramExitDateTime() {
        return programExitDateTime;
    }

    public void setProgramExitDateTime(DateTime programExitDateTime) {
        this.programExitDateTime = programExitDateTime;
    }

    public ObservationCollection getProgramExitObservations() {
        return programExitObservations;
    }

    public void setProgramExitObservations(ObservationCollection programExitObservations) {
        this.programExitObservations = programExitObservations;
    }
}