package org.openchs.dao;

import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.openchs.domain.Individual;
import org.openchs.domain.ObservationCollection;
import org.openchs.domain.ProgramEncounter;
import org.openchs.domain.ProgramEnrolment;

import java.util.Set;

public class LongitudinalExport {

    private Individual individual;
    private ProgramEnrolment programEnrolment;
    private Set<ProgramEncounter> programEncounters;

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

    public Set<ProgramEncounter> getProgramEncounters() {
        return programEncounters;
    }

    public void setProgramEncounters(Set<ProgramEncounter> programEncounters) {
        this.programEncounters = programEncounters;
    }
}
