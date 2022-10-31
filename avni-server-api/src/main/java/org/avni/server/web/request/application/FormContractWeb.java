package org.avni.server.web.request.application;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.avni.server.application.Form;
import org.avni.server.web.request.ReferenceDataContract;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class FormContractWeb extends ReferenceDataContract {
    private String formType;
    private String formName;
    private String formUUID;

    public FormContractWeb() {
    }

    public String getFormType() {
        return formType;
    }

    public void setFormType(String formType) {
        this.formType = formType;
    }

    public String getFormName(){
        return formName;
    }

    public void setFormName(String formName){
        this.formName = formName;
    }

    public String getFormUUID(){
        return formUUID;
    }

    public void setFormUUID(String formUUID){
        this.formUUID = formUUID;
    }

    public static FormContractWeb fromForm(Form form) {
        FormContractWeb formContract = new FormContractWeb();
        formContract.setFormType(form.getFormType().name());
        formContract.setFormName(form.getName());
        formContract.setFormUUID(form.getUuid());
        formContract.setVoided(form.isVoided());
        return formContract;
    }

    @Override
    @JsonInclude(JsonInclude.Include.NON_DEFAULT)
    public boolean isVoided() {
        return super.isVoided();
    }

}
