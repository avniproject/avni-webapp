package org.openchs.web.request.application;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import org.openchs.web.request.ReferenceDataDocument;

import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({ "name", "uuid", "formType", "programName", "userUUID", "formElementGroups" })
public class FormContract extends ReferenceDataDocument {
    private String formType;
    private String programName;
    private List<FormElementGroupContract> formElementGroups;

    public FormContract() {
    }

    public FormContract(String uuid, String userUUID, String name, String programName) {
        super(uuid, userUUID, name);
        this.programName = programName;
        formElementGroups = new ArrayList<>();
    }

    public String getFormType() {
        return formType;
    }

    public void setFormType(String formType) {
        this.formType = formType;
    }

    public List<FormElementGroupContract> getFormElementGroups() {
        return formElementGroups;
    }

    public void setFormElementGroups(List<FormElementGroupContract> formElementGroups) {
        this.formElementGroups = formElementGroups;
    }

    public String getProgramName() {
        return programName;
    }

    public void setProgramName(String programName) {
        this.programName = programName;
    }

    public void addFormElementGroup(FormElementGroupContract formElementGroupContract) {
        formElementGroups.add(formElementGroupContract);
    }
}