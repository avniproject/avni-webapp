package org.avni.server.web.request.application;

import org.avni.server.application.Form;
import org.avni.server.application.FormElement;
import org.avni.server.application.FormElementGroup;

public class FormUsageContract {
    private String formName;
    private String formUUID;
    private Long formId;
    private String formElementGroupUUID;
    private String formElementUUID;

    static public FormUsageContract fromEntity(FormElement formElement) {
        FormUsageContract formUsageContract = new FormUsageContract();
        formUsageContract.setFormElementUUID(formElement.getUuid());
        FormElementGroup formElementGroup = formElement.getFormElementGroup();
        formUsageContract.setFormElementGroupUUID(formElementGroup.getUuid());
        Form form = formElementGroup.getForm();
        formUsageContract.setFormId(form.getId());
        formUsageContract.setFormName(form.getName());
        formUsageContract.setFormUUID(form.getUuid());
        return formUsageContract;
    }

    public String getFormName() {
        return formName;
    }

    public void setFormName(String formName) {
        this.formName = formName;
    }

    public String getFormUUID() {
        return formUUID;
    }

    public void setFormUUID(String formUUID) {
        this.formUUID = formUUID;
    }

    public Long getFormId() {
        return formId;
    }

    public void setFormId(Long formId) {
        this.formId = formId;
    }

    public String getFormElementGroupUUID() {
        return formElementGroupUUID;
    }

    public void setFormElementGroupUUID(String formElementGroupUUID) {
        this.formElementGroupUUID = formElementGroupUUID;
    }

    public String getFormElementUUID() {
        return formElementUUID;
    }

    public void setFormElementUUID(String formElementUUID) {
        this.formElementUUID = formElementUUID;
    }
}
