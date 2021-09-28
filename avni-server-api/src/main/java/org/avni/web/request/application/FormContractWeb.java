package org.avni.web.request.application;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import org.avni.application.Form;
import org.avni.web.request.ReferenceDataContract;

import java.io.InvalidObjectException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;
import org.joda.time.DateTime;

import static org.avni.application.FormElement.PLACEHOLDER_CONCEPT_NAME;
import static org.avni.application.FormElement.PLACEHOLDER_CONCEPT_UUID;

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
