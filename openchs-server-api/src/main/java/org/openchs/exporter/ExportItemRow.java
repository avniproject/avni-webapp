package org.openchs.exporter;

import org.openchs.domain.*;

import java.util.List;

public class ExportItemRow {

    private Individual individual;
    private ProgramEnrolment programEnrolment;
    private List<ProgramEncounter> programEncounters;
    private List<Encounter> encounters;


    public List<Encounter> getEncounters() {
        return encounters;
    }

    public void setEncounters(List<Encounter> encounters) {
        this.encounters = encounters;
    }

    public List<ProgramEncounter> getProgramEncounters() {
        return programEncounters;
    }

    public void setProgramEncounters(List<ProgramEncounter> programEncounters) {
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
