package org.avni.server.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import org.avni.server.application.FormMapping;
import org.avni.server.application.FormType;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({"name", "uuid", "dataType", "answers", "lowAbsolute", "highAbsolute", "lowNormal", "highNormal", "unit", "unique"})
public class FormMappingContract extends ReferenceDataContract {

    private String formUUID;
    private String programUUID;
    private String encounterTypeUUID;
    private String subjectTypeUUID;
    private FormType formType;
    private Boolean isVoided;
    private String formName;
    private Boolean enableApproval;
    private String taskTypeUUID;

    public String getFormUUID() {
        return formUUID;
    }

    public void setFormUUID(String formUUID) {
        this.formUUID = formUUID;
    }

    public String getProgramUUID() {
        return programUUID;
    }

    public void setProgramUUID(String programUUID) {
        this.programUUID = programUUID;
    }

    public String getEncounterTypeUUID() {
        return encounterTypeUUID;
    }

    public void setEncounterTypeUUID(String encounterTypeUUID) {
        this.encounterTypeUUID = encounterTypeUUID;
    }

    public String getSubjectTypeUUID() {
        return subjectTypeUUID;
    }

    public void setSubjectTypeUUID(String subjectTypeUUID) {
        this.subjectTypeUUID = subjectTypeUUID;
    }

    public void setFormType(FormType formType){
        this.formType=formType;
    }

    public FormType getFormType() {
        return formType;
    }

    public void setFormName(String formName){
        this.formName=formName;
    }

    public String getFormName() {
        return formName;
    }

    public Boolean getIsVoided() { return isVoided; }

    public Boolean getEnableApproval() {
        return enableApproval;
    }

    public void setEnableApproval(Boolean enableApproval) {
        this.enableApproval = enableApproval;
    }

    public static FormMappingContract fromFormMapping(FormMapping formMapping) {
        FormMappingContract contract = new FormMappingContract();
        contract.setUuid(formMapping.getUuid());
        contract.setId(formMapping.getId());
        contract.setFormType(formMapping.getType());
        contract.setFormName(formMapping.getFormName());
        contract.setSubjectTypeUUID(formMapping.getSubjectTypeUuid());
        contract.setProgramUUID(formMapping.getProgramUuid());
        contract.setFormUUID(formMapping.getFormUuid());
        contract.setTaskTypeUUID(formMapping.getTaskTypeUuid());
        contract.setEncounterTypeUUID(formMapping.getEncounterTypeUuid());
        contract.setVoided(formMapping.isVoided());
        contract.setEnableApproval(formMapping.isEnableApproval());
        return contract;
    }

    @Override
    public String toString() {
        return String.format("UUID: %s, formUUID: %s, programUUID: %s, encounterTypeUUID: %s", this.getUuid(), this.getFormUUID(), this.getProgramUUID(), this.getEncounterTypeUUID());
    }

    @Override
    @JsonInclude(JsonInclude.Include.NON_DEFAULT)
    public boolean isVoided() {
        return super.isVoided();
    }

    public void setTaskTypeUUID(String taskTypeUUID) {
        this.taskTypeUUID = taskTypeUUID;
    }

    public String getTaskTypeUUID() {
        return taskTypeUUID;
    }
}
