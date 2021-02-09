package org.openchs.domain.metadata;

import org.openchs.domain.EncounterType;
import org.openchs.domain.Program;
import org.openchs.domain.SubjectType;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SubjectTypes implements MetaData {
    private List<SubjectType> subjectTypes;
    private Map<SubjectType, Program> programs = new HashMap<>();
    private Map<SubjectType, Map<Program, EncounterType>> programEncounterTypes = new HashMap<>();
    private Map<SubjectType, EncounterType> generalEncounterTypes = new HashMap<>();

    public SubjectTypes(List<SubjectType> subjectTypes) {
        this.subjectTypes = subjectTypes;
    }

    @Override
    public void accept(MetaDataVisitor metaDataVisitor) {
        this.subjectTypes.forEach(metaDataVisitor::visit);
        this.programs.forEach(metaDataVisitor::visit);
        this.programEncounterTypes.forEach((subjectType, programEncounterTypeMap) -> {
            programEncounterTypeMap.forEach((program, encounterType) -> {
                metaDataVisitor.visit(subjectType, program, encounterType);
            });
        });
        this.generalEncounterTypes.forEach(metaDataVisitor::visit);
    }

    public void addProgram(SubjectType subjectType, Program program) {
        programs.put(subjectType, program);
    }

    public void addEncounterType(SubjectType subjectType, Program program, EncounterType encounterType) {
        Map<Program, EncounterType> programEncounterTypeMap = programEncounterTypes.get(subjectType);
        if (programEncounterTypeMap == null) {
            programEncounterTypeMap = new HashMap<>();
            programEncounterTypeMap.put(program, encounterType);
        }
        programEncounterTypes.put(subjectType, programEncounterTypeMap);
    }

    public void addEncounterType(SubjectType subjectType, EncounterType encounterType) {
        generalEncounterTypes.put(subjectType, encounterType);
    }
}