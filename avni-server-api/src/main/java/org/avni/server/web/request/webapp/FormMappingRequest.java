package org.avni.server.web.request.webapp;

public class FormMappingRequest {
    private String uuid;
    private String subjectTypeUuid;
    private String programUuid;
    private String encounterTypeUuid;
    private String taskTypeUuid;
    private boolean isVoided;

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }


    public String getSubjectTypeUuid() {
        return subjectTypeUuid;
    }

    public void setSubjectTypeUuid(String subjectTypeUuid) {
        this.subjectTypeUuid = subjectTypeUuid;
    }

    public String getProgramUuid() {
        return programUuid;
    }

    public void setProgramUuid(String programUuid) {
        this.programUuid = programUuid;
    }

    public String getEncounterTypeUuid() {
        return encounterTypeUuid;
    }

    public void setEncounterTypeUuid(String encounterTypeUuid) {
        this.encounterTypeUuid = encounterTypeUuid;
    }

    public boolean getVoided(){ return isVoided; }

    public void setVoided(boolean isVoided){ this.isVoided = isVoided; }

    public String getTaskTypeUuid() {
        return taskTypeUuid;
    }

    public void setTaskTypeUuid(String taskTypeUuid) {
        this.taskTypeUuid = taskTypeUuid;
    }
}
