package org.avni.server.domain.factory.metadata;

import org.avni.server.application.FormElement;
import org.avni.server.domain.Concept;

public class FormElementBuilder {
    private FormElement formElement = new FormElement();

    public FormElementBuilder withUuid(String uuid) {
        formElement.setUuid(uuid);
        return this;
    }

    public FormElementBuilder withConcept(Concept concept) {
        formElement.setConcept(concept);
        return this;
    }

    public FormElement build() {
        return formElement;
    }
}
