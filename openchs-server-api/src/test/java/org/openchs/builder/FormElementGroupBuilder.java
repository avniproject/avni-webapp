package org.openchs.builder;

import org.openchs.web.request.application.FormContract;
import org.openchs.web.request.application.FormElementContract;
import org.openchs.web.request.application.FormElementGroupContract;

public class FormElementGroupBuilder {
    private final FormElementGroupContract formElementGroup;

    public FormElementGroupBuilder() {
        formElementGroup = new FormElementGroupContract();
    }

    public FormElementGroupBuilder withName(String name) {
        formElementGroup.setName(name);
        return this;
    }

    public FormElementGroupBuilder withUUID(String uuid) {
        formElementGroup.setUuid(uuid);
        return this;
    }

    public FormElementGroupBuilder atOrder(Integer order) {
        formElementGroup.setDisplayOrder(Short.valueOf(String.valueOf(order)));
        return this;
    }

    public FormElementGroupBuilder addFormElement(FormElementContract formElementContract) {
        this.formElementGroup.addFormElement(formElementContract);
        return this;
    }

    public FormElementGroupContract build() {
        return this.formElementGroup;
    }

}
