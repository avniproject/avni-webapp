package org.openchs.web.request.application;

import org.openchs.web.request.ReferenceDataRequest;

import java.util.List;

public class FormRequest extends ReferenceDataRequest {
    private String formType;
    private List<FormElementGroupRequest> formElementGroups;
    private String programName;
    private String uuid;

    public String getFormType() {
        return formType;
    }

    public void setFormType(String formType) {
        this.formType = formType;
    }

    public List<FormElementGroupRequest> getFormElementGroups() {
        return formElementGroups;
    }

    public void setFormElementGroups(List<FormElementGroupRequest> formElementGroups) {
        this.formElementGroups = formElementGroups;
    }

    public String getProgramName() {
        return programName;
    }

    public void setProgramName(String programName) {
        this.programName = programName;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }
}