package org.avni.exporter.v2;

import org.avni.domain.*;

import java.util.List;
import java.util.Map;

public class ItemRow {
    private Individual individual;
    private Map<ProgramEnrolment, Map<EncounterType, List<ProgramEncounter>>> programEnrolmentToEncountersMap;
    private Map<EncounterType, List<Encounter>> encounterTypeToEncountersMap;
    private Map<Individual, Map<EncounterType, List<Encounter>>> groupSubjectToEncountersMap;

    public Individual getIndividual() {
        return individual;
    }

    public void setIndividual(Individual individual) {
        this.individual = individual;
    }

    public Map<ProgramEnrolment, Map<EncounterType, List<ProgramEncounter>>> getProgramEnrolmentToEncountersMap() {
        return programEnrolmentToEncountersMap;
    }

    public void setProgramEnrolmentToEncountersMap(Map<ProgramEnrolment, Map<EncounterType, List<ProgramEncounter>>> programEnrolmentToEncountersMap) {
        this.programEnrolmentToEncountersMap = programEnrolmentToEncountersMap;
    }

    public Map<EncounterType, List<Encounter>> getEncounterTypeToEncountersMap() {
        return encounterTypeToEncountersMap;
    }

    public void setEncounterTypeToEncountersMap(Map<EncounterType, List<Encounter>> encounterTypeToEncountersMap) {
        this.encounterTypeToEncountersMap = encounterTypeToEncountersMap;
    }

    public Map<Individual, Map<EncounterType, List<Encounter>>> getGroupSubjectToEncountersMap() {
        return groupSubjectToEncountersMap;
    }

    public void setGroupSubjectToEncountersMap(Map<Individual, Map<EncounterType, List<Encounter>>> groupSubjectToEncountersMap) {
        this.groupSubjectToEncountersMap = groupSubjectToEncountersMap;
    }
}
