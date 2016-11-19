package org.openchs.domain;

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
}