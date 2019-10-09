package org.openchs.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import org.openchs.application.FormMapping;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({"name", "uuid", "dataType", "answers", "lowAbsolute", "highAbsolute", "lowNormal", "highNormal", "unit", "unique"})
public class FormMappingContract extends ReferenceDataContract {

    private String formUUID;
    private String programUUID;
    private String encounterTypeUUID;
    private String subjectTypeUUID;

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

    public static FormMappingContract fromFormMapping(FormMapping formMapping) {
        FormMappingContract contract = new FormMappingContract();
        contract.setUuid(formMapping.getUuid());
        contract.setSubjectTypeUUID(formMapping.getSubjectTypeUuid());
        contract.setProgramUUID(formMapping.getProgramUuid());
        contract.setFormUUID(formMapping.getFormUuid());
        contract.setEncounterTypeUUID(formMapping.getEncounterTypeUuid());
        return contract;
    }

    @Override
    public String toString() {
        return String.format("UUID: %s, formUUID: %s, programUUID: %s, encounterTypeUUID: %s", this.getUuid(), this.getFormUUID(), this.getProgramUUID(), this.getEncounterTypeUUID());
    }
}
