package org.avni.server.builder;

import org.avni.server.application.FormElement;
import org.avni.server.application.FormElementGroup;
import org.avni.server.application.Format;
import org.avni.server.application.KeyValues;
import org.avni.server.domain.Concept;
import org.avni.server.domain.DeclarativeRule;
import org.avni.server.domain.Documentation;

public class FormElementBuilder extends BaseBuilder<FormElement, FormElementBuilder> {
    private final FormElementGroup formElementGroup;

    public FormElementBuilder(FormElementGroup formElementGroup, FormElement existingFormElement, FormElement newFormElement) {
        super(existingFormElement, newFormElement);
        this.formElementGroup = formElementGroup;
    }

    public FormElementBuilder withName(String name) {
        this.set("Name", name, String.class);
        return this;
    }

    public FormElementBuilder withDisplayOrder(Double displayOrder) {
        this.set("DisplayOrder", displayOrder, Double.class);
        return this;
    }

    public FormElementBuilder withIsVoided(boolean isVoided, boolean isFormElementGroupVoided) {
        this.set("Voided", isVoided || isFormElementGroupVoided, Boolean.class);
        return this;
    }

    public FormElementBuilder withMandatory(Boolean mandatory) {
        this.set("Mandatory", mandatory, Boolean.class);
        return this;
    }

    public FormElementBuilder withKeyValues(KeyValues keyValues) {
        this.get().setKeyValues(keyValues);
        return this;
    }

    public FormElementBuilder withConcept(Concept existingConcept) {
        this.get().setConcept(existingConcept);
        return this;
    }

    public FormElementBuilder withType(String type) {
        this.set("Type", type, String.class);
        return this;
    }

    public FormElementBuilder withValidFormat(Format format) {
        this.get().setValidFormat(format);
        return this;
    }

    public FormElementBuilder withRule(String rule) {
        this.get().setRule(rule);
        return this;
    }

    public FormElementBuilder withDeclarativeRule(DeclarativeRule declarativeRule) {
        this.get().setDeclarativeRule(declarativeRule);
        return this;
    }

    public FormElementBuilder withGroup(FormElement group) {
        this.get().setGroup(group);
        return this;
    }

    public FormElementBuilder withDocumentation(Documentation documentation) {
        this.get().setDocumentation(documentation);
        return this;
    }

    //This is done separately instead of regular builder because during the building if any db query has to be fired it tries to flush out existing state which is incomplete and gives validation error
    public void linkWithFormElementGroup() {
        this.get().setFormElementGroup(formElementGroup);
        if (existingEntity == null)
            formElementGroup.addFormElement(newEntity);
    }

    @Override
    public FormElement build() {
        FormElement formElement = super.build();
        formElement.validate();
        return formElement;
    }
}
