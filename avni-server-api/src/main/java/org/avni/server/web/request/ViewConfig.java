package org.avni.server.web.request;

public class ViewConfig {
    private Type type;
    // operationalProgramName
    private String program;
    // operationalEncounterType;
    private String encounterType;
    // operationalSubjectType
    private String subjectType;

    private boolean spreadMultiSelectObs;

    public Type getType() {
        return type;
    }

    public void setType(Type type) {
        this.type = type;
    }

    public String getProgram() {
        return program;
    }

    public void setProgram(String program) {
        this.program = program;
    }

    public String getEncounterType() {
        return encounterType;
    }

    public void setEncounterType(String encounterType) {
        this.encounterType = encounterType;
    }

    public boolean getSpreadMultiSelectObs() {
        return spreadMultiSelectObs;
    }

    public String getSubjectType() {
        return subjectType;
    }

    public void setSubjectType(String subjectType) {
        this.subjectType = subjectType;
    }

    public void setSpreadMultiSelectObs(boolean spreadMultiSelectObs) {
        this.spreadMultiSelectObs = spreadMultiSelectObs;
    }

    public enum Type {
        Registration, ProgramEncounter, Encounter
    }
}

