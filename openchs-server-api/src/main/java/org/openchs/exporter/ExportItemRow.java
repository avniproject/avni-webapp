package org.openchs.exporter;

import org.openchs.domain.*;

import java.util.stream.Stream;

public class ExportItemRow {

    private Individual individual;
    private ProgramEnrolment programEnrolment;
    private Stream<ProgramEncounter> programEncounters;
    private Stream<Encounter> encounters;


    public Stream<Encounter> getEncounters() {
        return encounters;
    }

    public void setEncounters(Stream<Encounter> encounters) {
        this.encounters = encounters;
    }

    public Stream<ProgramEncounter> getProgramEncounters() {
        return programEncounters;
    }

    public void setProgramEncounters(Stream<ProgramEncounter> programEncounters) {
        this.programEncounters = programEncounters;
    }

    public Individual getIndividual() {
        return individual;
    }

    public void setIndividual(Individual individual) {
        this.individual = individual;
    }

    public ProgramEnrolment getProgramEnrolment() {
        return programEnrolment;
    }

    public void setProgramEnrolment(ProgramEnrolment programEnrolment) {
        this.programEnrolment = programEnrolment;
    }

}
