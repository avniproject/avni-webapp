package org.avni.server.domain.metadata;

import org.avni.server.domain.EncounterType;
import org.avni.server.domain.Program;
import org.avni.server.domain.SubjectType;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SubjectTypes implements MetaData {
    private List<SubjectType> subjectTypes;
    private Map<SubjectType, List<Program>> programs = new HashMap<>();
    private Map<SubjectType, Map<Program, List<EncounterType>>> programEncounterTypes = new HashMap<>();
    private Map<SubjectType, List<EncounterType>> generalEncounterTypes = new HashMap<>();

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
        this.programs.forEach((subjectType, programs) ->
                programs.forEach(program -> {
                    if (program.getOperationalProgramName() != null)
                        metaDataVisitor.visit(subjectType, program);
                }));
        this.programEncounterTypes.forEach((subjectType, programEncounterTypeMap) ->
                programEncounterTypeMap.forEach((program, encounterTypes) -> {
                    encounterTypes.forEach(encounterType -> {
                        if (encounterType.getOperationalEncounterTypeName() != null)
                            metaDataVisitor.visit(subjectType, program, encounterType);
                    });
                }));
        this.generalEncounterTypes.forEach((subjectType, encounterTypes) ->
                encounterTypes.forEach(encounterType -> {
                    if (encounterType.getOperationalEncounterTypeName() != null)
                        metaDataVisitor.visit(subjectType, encounterType);
                }));
    }

    public void addProgram(SubjectType subjectType, Program program) {
        List<Program> addedPrograms = this.programs.get(subjectType);
        if (addedPrograms == null) {
            addedPrograms = new ArrayList<>();
        }
        addedPrograms.add(program);
        this.programs.put(subjectType, addedPrograms);
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
        List<EncounterType> addedEncounterTypes = this.generalEncounterTypes.get(subjectType);
        if (addedEncounterTypes == null) {
            addedEncounterTypes = new ArrayList<>();
        }
        addedEncounterTypes.add(encounterType);
        this.generalEncounterTypes.put(subjectType, addedEncounterTypes);
    }

    public Map<SubjectType, Map<Program, List<EncounterType>>> getProgramEncounterTypes() {
        return programEncounterTypes;
    }
}
