package org.openchs.builder;

import org.openchs.web.request.application.FormContract;
import org.openchs.web.request.application.FormElementGroupContract;

public class FormBuilder {

    private final FormContract form;

    public FormBuilder() {
        form = new FormContract();
    }

    public FormBuilder withName(String name) {
        form.setName(name);
        return this;
    }

    public FormBuilder withUUID(String uuid) {
        form.setUuid(uuid);
        return this;
    }

    public FormBuilder ofFormType(String formType) {
        form.setFormType(formType);
        return this;
    }

    public FormBuilder addFormElementGroup(FormElementGroupContract formElementGroup) {
        form.addFormElementGroup(formElementGroup);
        return this;
    }

    public FormContract build() {
        return this.form;
    }

}
