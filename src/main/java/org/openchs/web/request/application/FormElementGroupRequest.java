package org.openchs.web.request.application;

import org.openchs.web.request.ReferenceDataRequest;

import java.util.List;

public class FormElementGroupRequest extends ReferenceDataRequest {
    private short displayOrder;
    private List<FormElementRequest> formElements;

    public short getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(short displayOrder) {
        this.displayOrder = displayOrder;
    }

    public List<FormElementRequest> getFormElements() {
        return formElements;
    }

    public void setFormElements(List<FormElementRequest> formElements) {
        this.formElements = formElements;
    }
}