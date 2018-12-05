package org.openchs.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Type;
import org.joda.time.DateTime;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "program_enrolment")
@JsonIgnoreProperties({"programEncounters", "individual"})
@BatchSize(size = 100)
public class ProgramEnrolment extends OrganisationAwareEntity {
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id")
    private Program program;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "individual_id")
    private Individual individual;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "programEnrolment")
    private Set<ProgramEncounter> programEncounters;

    @Column
    @NotNull
    private DateTime enrolmentDateTime;

    @Column
    @Type(type = "observations")
    private ObservationCollection observations;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_outcome_id")
    private ProgramOutcome programOutcome;

    @Column
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
        if (programEncounters == null) {
            programEncounters = new HashSet<>();
        }
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

    public ObservationCollection getObservations() {
        return observations;
    }

    public void setObservations(ObservationCollection observations) {
        this.observations = observations;
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

    public ProgramEncounter findEncounter(String encounterTypeName, String encounterName) {
        return this.getProgramEncounters().stream().filter(programEncounter -> programEncounter.matches(encounterTypeName, encounterName)).findAny().orElse(null);
    }
}