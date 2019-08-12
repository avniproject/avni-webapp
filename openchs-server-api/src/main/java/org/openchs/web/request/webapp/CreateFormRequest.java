package org.openchs.web.request.webapp;

import java.util.List;

public class CreateFormRequest {

    private String formType;
    private String name;
    private String subjectType;
    private String programName;
    private List<String> encounterTypes;

    public String getFormType() {
        return formType;
    }

    public void setFormType(String formType) {
        this.formType = formType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public List<String> getEncounterTypes() {
        return encounterTypes;
    }

    public void setEncounterTypes(List<String> encounterTypes) {
        this.encounterTypes = encounterTypes;
    }
}