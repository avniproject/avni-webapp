package org.openchs.web.request.webapp;

public class FormMappingRequest {
    private String uuid;
    private String subjectType;
    private String programName;
    private String encounterType;
    private boolean isVoided;

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }


    public String getSubjectType() {
        return subjectType;
    }

    public void setSubjectType(String subjectType) {
        this.subjectType = subjectType;
    }

    public String getProgramName() {
        return programName;
    }

    public void setProgramName(String programName) {
        this.programName = programName;
    }

    public String getEncounterType() {
        return encounterType;
    }

    public void setEncounterType(String encounterType) {
        this.encounterType = encounterType;
    }

    public boolean getVoided(){ return isVoided; }

    public void setVoided(boolean isVoided){ this.isVoided = isVoided; }
}