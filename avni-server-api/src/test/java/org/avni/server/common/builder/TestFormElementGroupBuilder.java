package org.avni.server.common.builder;

import org.avni.server.web.request.application.FormElementContract;
import org.avni.server.web.request.application.FormElementGroupContract;

public class TestFormElementGroupBuilder {
    private final FormElementGroupContract formElementGroup;

    public TestFormElementGroupBuilder() {
        formElementGroup = new FormElementGroupContract();
    }

    public TestFormElementGroupBuilder withName(String name) {
        formElementGroup.setName(name);
        return this;
    }

    public TestFormElementGroupBuilder withUUID(String uuid) {
        formElementGroup.setUuid(uuid);
        return this;
    }

    public TestFormElementGroupBuilder atOrder(Integer order) {
        formElementGroup.setDisplayOrder(Double.valueOf(String.valueOf(order)));
        return this;
    }

    public TestFormElementGroupBuilder addFormElement(FormElementContract formElementContract) {
        this.formElementGroup.addFormElement(formElementContract);
        return this;
    }

    public FormElementGroupContract build() {
        return this.formElementGroup;
    }

}
