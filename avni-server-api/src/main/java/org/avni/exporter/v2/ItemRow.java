package org.avni.exporter.v2;

import org.avni.domain.Encounter;
import org.avni.domain.Individual;
import org.avni.domain.ProgramEncounter;
import org.avni.domain.ProgramEnrolment;
import org.avni.web.request.export.ExportEntityType;

import java.util.List;
import java.util.Map;

public class ItemRow {
    private Individual individual;
    private Map<ProgramEnrolment, Map<ExportEntityType, List<ProgramEncounter>>> programEnrolmentToEncountersMap;
    private Map<ExportEntityType, List<Encounter>> exportEntityTypeToEncountersMap;
    private Map<Individual, Map<ExportEntityType, List<Encounter>>> groupSubjectToEncountersMap;

    public Individual getIndividual() {
        return individual;
    }

    public void setIndividual(Individual individual) {
        this.individual = individual;
    }

    public Map<ProgramEnrolment, Map<ExportEntityType, List<ProgramEncounter>>> getProgramEnrolmentToEncountersMap() {
        return programEnrolmentToEncountersMap;
    }

    public void setProgramEnrolmentToEncountersMap(Map<ProgramEnrolment, Map<ExportEntityType, List<ProgramEncounter>>> programEnrolmentToEncountersMap) {
        this.programEnrolmentToEncountersMap = programEnrolmentToEncountersMap;
    }

    public Map<ExportEntityType, List<Encounter>> getExportEntityTypeToEncountersMap() {
        return exportEntityTypeToEncountersMap;
    }

    public void setExportEntityTypeToEncountersMap(Map<ExportEntityType, List<Encounter>> exportEntityTypeToEncountersMap) {
        this.exportEntityTypeToEncountersMap = exportEntityTypeToEncountersMap;
    }

    public Map<Individual, Map<ExportEntityType, List<Encounter>>> getGroupSubjectToEncountersMap() {
        return groupSubjectToEncountersMap;
    }

    public void setGroupSubjectToEncountersMap(Map<Individual, Map<ExportEntityType, List<Encounter>>> groupSubjectToEncountersMap) {
        this.groupSubjectToEncountersMap = groupSubjectToEncountersMap;
    }
}
