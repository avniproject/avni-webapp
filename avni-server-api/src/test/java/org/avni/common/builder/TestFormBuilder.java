package org.avni.common.builder;

import org.avni.server.web.request.application.FormContract;
import org.avni.server.web.request.application.FormElementGroupContract;

public class TestFormBuilder {

    private final FormContract form;

    public TestFormBuilder() {
        form = new FormContract();
    }

    public TestFormBuilder withName(String name) {
        form.setName(name);
        return this;
    }

    public TestFormBuilder withUUID(String uuid) {
        form.setUuid(uuid);
        return this;
    }

    public TestFormBuilder ofFormType(String formType) {
        form.setFormType(formType);
        return this;
    }

    public TestFormBuilder addFormElementGroup(FormElementGroupContract formElementGroup) {
        form.addFormElementGroup(formElementGroup);
        return this;
    }

    public FormContract build() {
        return this.form;
    }

}
