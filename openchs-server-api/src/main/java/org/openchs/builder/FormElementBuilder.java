package org.openchs.builder;

import org.openchs.application.FormElement;
import org.openchs.application.FormElementGroup;
import org.openchs.application.Format;
import org.openchs.application.KeyValues;
import org.openchs.domain.Concept;
import org.openchs.framework.ApplicationContextProvider;
import org.openchs.service.ConceptService;
import org.openchs.web.request.ConceptContract;
import org.openchs.web.request.FormatContract;

public class FormElementBuilder extends BaseBuilder<FormElement, FormElementBuilder> {

    private final ConceptService conceptService;

    public FormElementBuilder(FormElementGroup formElementGroup, FormElement existingFormElement) {
        super(existingFormElement, new FormElement());
        this.get().setFormElementGroup(formElementGroup);
        conceptService = ApplicationContextProvider.getContext().getBean(ConceptService.class);
    }

    public FormElementBuilder withName(String name) {
        this.set("Name", name, String.class);
        return this;
    }

    public FormElementBuilder withDisplayOrder(Double displayOrder) {
        this.set("DisplayOrder", displayOrder, Double.class);
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

    private Concept getExistingConcept(String uuid) {
        return this.get().getConcept() != null && this.get().getConcept().getUuid().equals(uuid) ?
                this.get().getConcept() : conceptService.get(uuid);
    }

    public FormElementBuilder withConcept(ConceptContract conceptContract) {
        Concept existingConcept = getExistingConcept(conceptContract.getUuid());
        ConceptBuilder conceptBuilder = new ConceptBuilder(existingConcept);
        Concept concept = conceptBuilder
                .withUUID(conceptContract.getUuid())
                .withName(conceptContract.getName())
                .withDataType(conceptContract.getDataType())
                .withNumericParams(conceptContract.getHighAbsolute(), conceptContract.getHighNormal(),
                        conceptContract.getLowAbsolute(), conceptContract.getLowNormal(), conceptContract.getUnit())
                .withVoided(conceptContract.isVoided())
                .withConceptAnswers(conceptContract.getAnswers())
                .build();
        this.get().setConcept(concept);
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

}
