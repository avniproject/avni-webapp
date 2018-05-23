package org.openchs.builder;

import org.openchs.application.FormElement;
import org.openchs.application.FormElementGroup;
import org.openchs.application.Format;
import org.openchs.application.KeyValues;
import org.openchs.domain.Concept;
import org.openchs.web.request.ConceptContract;

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

    public FormElementBuilder withIsVoided(boolean isVoided) {
        this.set("Voided", isVoided, Boolean.class);
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

    //This is done separately instead of regular builder because during the building if any db query has to be fired it tries to flush out existing state which is incomplete and gives validation error
    public void linkWithFormElementGroup() {
        this.get().setFormElementGroup(formElementGroup);
        if (existingEntity == null)
            formElementGroup.addFormElement(newEntity);
    }
}