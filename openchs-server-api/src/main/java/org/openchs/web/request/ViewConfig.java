package org.openchs.web.request;

public class ViewConfig {
    private Type type;
    // operationalProgramName
    private String program;
    // operationalEncounterType;
    private String encounterType;
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

    public void setSpreadMultiSelectObs(boolean spreadMultiSelectObs) {
        this.spreadMultiSelectObs = spreadMultiSelectObs;
    }

    public enum Type {
        Registration, ProgramEncounter
    }
}

