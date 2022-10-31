package org.avni.server.common.builder;

import org.avni.server.web.request.ConceptContract;
import org.avni.server.web.request.application.FormElementContract;

public class TestFormElementBuilder {
    private final FormElementContract formElement;

    public TestFormElementBuilder() {
        formElement = new FormElementContract();
        formElement.setMandatory(false);
        formElement.setType("SingleSelect");
        formElement.setDisplayOrder(1.1);
        formElement.setValidFormat(null);
    }

    public TestFormElementBuilder withName(String name) {
        formElement.setName(name);
        return this;
    }

    public TestFormElementBuilder withUUID(String uuid) {
        formElement.setUuid(uuid);
        return this;
    }

    public TestFormElementBuilder withConcept(ConceptContract conceptContract) {
        formElement.setConcept(conceptContract);
        return this;
    }

    public TestFormElementBuilder isMandatory() {
        formElement.setMandatory(true);
        return this;
    }

    public FormElementContract build() {
        return this.formElement;
    }

}
