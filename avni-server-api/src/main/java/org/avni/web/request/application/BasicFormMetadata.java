package org.avni.web.request.application;

import org.avni.application.Form;
import org.avni.application.FormType;

public class BasicFormMetadata {
    private String name;
    private String uuid;
    private FormType formType;

    public BasicFormMetadata(Form form) {
        this.name = form.getName();
        this.uuid = form.getUuid();
        this.formType = form.getFormType();
    }

    public String getName() { return name; }

    public void setName(String name) {
        this.name = name;
    }

    public String getUuid() { return uuid; }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public FormType getFormType() { return formType; }

    public void setFormType(FormType formType) {
        this.formType = formType;
    }
}
