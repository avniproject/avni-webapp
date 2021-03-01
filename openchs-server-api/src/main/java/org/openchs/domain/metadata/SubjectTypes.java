package org.openchs.domain.metadata;

import org.openchs.domain.EncounterType;
import org.openchs.domain.Program;
import org.openchs.domain.SubjectType;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SubjectTypes implements MetaData {
    private List<SubjectType> subjectTypes;
    private Map<SubjectType, Program> programs = new HashMap<>();
    private Map<SubjectType, Map<Program, List<EncounterType>>> programEncounterTypes = new HashMap<>();
    private Map<SubjectType, EncounterType> generalEncounterTypes = new HashMap<>();

    public SubjectTypes(List<SubjectType> subjectTypes) {
        this.subjectTypes = subjectTypes;
    }

    @Override
    public void accept(MetaDataVisitor metaDataVisitor) {
        //todo all operational type checks are not required but the database has such records
        this.subjectTypes.forEach(subjectType -> {
            if (subjectType.getOperationalSubjectType() != null)
                metaDataVisitor.visit(subjectType);
        });
        this.programs.forEach((subjectType, program) -> {
            if (program.getOperationalProgramName() != null)
                metaDataVisitor.visit(subjectType, program);
        });
        this.programEncounterTypes.forEach((subjectType, programEncounterTypeMap) -> {
            programEncounterTypeMap.forEach((program, encounterTypes) -> {
                encounterTypes.forEach(encounterType -> {
                    if (encounterType.getOperationalEncounterTypeName() != null)
                        metaDataVisitor.visit(subjectType, program, encounterType);
                });
            });
        });
        this.generalEncounterTypes.forEach((subjectType, encounterType) -> {
            if (encounterType.getOperationalEncounterTypeName() != null)
                metaDataVisitor.visit(subjectType, encounterType);
        });
    }

    public void addProgram(SubjectType subjectType, Program program) {
        programs.put(subjectType, program);
    }

    public void addEncounterType(SubjectType subjectType, Program program, EncounterType encounterType) {
        Map<Program, List<EncounterType>> programEncounterTypeMap = programEncounterTypes.get(subjectType);
        if (programEncounterTypeMap == null) {
            programEncounterTypeMap = new HashMap<>();
            programEncounterTypes.put(subjectType, programEncounterTypeMap);
        }

        List<EncounterType> encounterTypes = programEncounterTypeMap.get(program);
        if (encounterTypes == null) {
            encounterTypes = new ArrayList<>();
            programEncounterTypeMap.put(program, encounterTypes);
        }
        encounterTypes.add(encounterType);
    }

    public void addEncounterType(SubjectType subjectType, EncounterType encounterType) {
        generalEncounterTypes.put(subjectType, encounterType);
    }

    public Map<SubjectType, Map<Program, List<EncounterType>>> getProgramEncounterTypes() {
        return programEncounterTypes;
    }
}