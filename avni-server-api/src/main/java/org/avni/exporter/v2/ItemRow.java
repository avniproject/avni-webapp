package org.avni.exporter.v2;

import org.avni.domain.Encounter;
import org.avni.domain.Individual;
import org.avni.domain.ProgramEncounter;
import org.avni.domain.ProgramEnrolment;

import java.util.List;
import java.util.Map;

public class ItemRow {
    private Individual individual;
    private Map<ProgramEnrolment, List<ProgramEncounter>> programEnrolmentMap;
    private List<Encounter> encounters;
    private Map<Individual, List<Encounter>> groupSubjectMap;

    public Individual getIndividual() {
        return individual;
    }

    public void setIndividual(Individual individual) {
        this.individual = individual;
    }

    public Map<ProgramEnrolment, List<ProgramEncounter>> getProgramEnrolmentMap() {
        return programEnrolmentMap;
    }

    public void setProgramEnrolmentMap(Map<ProgramEnrolment, List<ProgramEncounter>> programEnrolmentMap) {
        this.programEnrolmentMap = programEnrolmentMap;
    }

    public List<Encounter> getEncounters() {
        return encounters;
    }

    public void setEncounters(List<Encounter> encounters) {
        this.encounters = encounters;
    }

    public Map<Individual, List<Encounter>> getGroupSubjectMap() {
        return groupSubjectMap;
    }

    public void setGroupSubjectMap(Map<Individual, List<Encounter>> groupSubjectMap) {
        this.groupSubjectMap = groupSubjectMap;
    }
}
