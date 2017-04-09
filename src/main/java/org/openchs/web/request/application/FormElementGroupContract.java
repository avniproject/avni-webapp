package org.openchs.web.request.application;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.openchs.web.request.ReferenceDataDocument;

import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class FormElementGroupContract extends ReferenceDataDocument {
    private short displayOrder;
    private List<FormElementContract> formElements;

    public FormElementGroupContract() {
    }

    public FormElementGroupContract(String uuid, String userUUID, String name, short displayOrder) {
        super(uuid, userUUID, name);
        this.displayOrder = displayOrder;
        formElements = new ArrayList<>();
    }

    public short getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(short displayOrder) {
        this.displayOrder = displayOrder;
    }

    public List<FormElementContract> getFormElements() {
        return formElements;
    }

    public void setFormElements(List<FormElementContract> formElements) {
        this.formElements = formElements;
    }

    public void addFormElement(FormElementContract formElementContract) {
        this.formElements.add(formElementContract);
    }
}