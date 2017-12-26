package org.openchs.builder;

import org.openchs.web.request.ConceptContract;
import org.openchs.web.request.application.FormContract;
import org.openchs.web.request.application.FormElementContract;
import org.openchs.web.request.application.FormElementGroupContract;

public class FormElementBuilder {
    private final FormElementContract formElement;

    public FormElementBuilder() {
        formElement = new FormElementContract();
        formElement.setMandatory(false);
        formElement.setType("SingleSelect");
        formElement.setDisplayOrder((short) 1);
        formElement.setValidFormat(null);
    }

    public FormElementBuilder withName(String name) {
        formElement.setName(name);
        return this;
    }

    public FormElementBuilder withUUID(String uuid) {
        formElement.setUuid(uuid);
        return this;
    }

    public FormElementBuilder withConcept(ConceptContract conceptContract) {
        formElement.setConcept(conceptContract);
        return this;
    }

    public FormElementBuilder isMandatory() {
        formElement.setMandatory(true);
        return this;
    }

    public FormElementContract build() {
        return this.formElement;
    }

}
