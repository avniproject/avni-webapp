package org.avni.builder;

import org.joda.time.DateTime;
import org.avni.application.Form;
import org.avni.application.FormElement;
import org.avni.application.FormElementGroup;
import org.avni.domain.Concept;
import org.avni.domain.Organisation;
import org.avni.framework.ApplicationContextProvider;
import org.avni.service.ConceptService;
import org.avni.web.request.application.FormElementContract;

import java.util.List;

public class FormElementGroupBuilder extends BaseBuilder<FormElementGroup, FormElementGroupBuilder> {
    private final ConceptService conceptService;

    public FormElementGroupBuilder(Form form, FormElementGroup existingFormElementGroup, FormElementGroup newFormElementGroup) {
        super(existingFormElementGroup, newFormElementGroup);
        this.get().setForm(form);
        if (existingFormElementGroup == null)
            form.addFormElementGroup(newFormElementGroup);
        conceptService = ApplicationContextProvider.getContext().getBean(ConceptService.class);
    }

    public FormElementGroupBuilder withName(String name) {
        this.set("Name", name, String.class);
        return this;
    }

    public FormElementGroupBuilder withDisplayOrder(Double displayOrder) {
        this.set("DisplayOrder", displayOrder, Double.class);
        return this;
    }

    public FormElementGroupBuilder withIsVoided(boolean isVoided) {
        this.set("Voided", isVoided, Boolean.class);
        return this;
    }

    public FormElementGroupBuilder withDisplay(String display) {
        this.set("Display", display, String.class);
        return this;
    }

    public FormElementGroupBuilder withRule(String rule) {
        this.get().setRule(rule);
        return this;
    }

    private FormElement getExistingFormElement(String uuid) {
        return this.get().findFormElement(uuid);
    }

    private Concept getExistingConcept(String uuid, FormElement formElement) throws FormBuilderException {
        Concept concept = formElement.getConcept() != null && formElement.getConcept().getUuid().equals(uuid) ?
                formElement.getConcept() : conceptService.get(uuid);
        if (concept == null) {
            throw new FormBuilderException(String.format("Concept with uuid '%s' not found", uuid));
        }
        return concept;
    }

    public FormElementGroupBuilder makeFormElements(List<FormElementContract> formElementContracts) throws FormBuilderException {
        for (FormElementContract formElementContract : formElementContracts) {
            makeFormElement(formElementContract);
        }
        return this;
    }

    private void makeFormElement(FormElementContract formElementContract) throws FormBuilderException {
        FormElement existingFormElement = getExistingFormElement(formElementContract.getUuid());
        FormElement newFormElement = new FormElement();
        Concept existingConcept = getExistingConcept(formElementContract.getConcept().getUuid(), existingFormElement == null ? newFormElement : existingFormElement);
        FormElementBuilder formElementBuilder = new FormElementBuilder(this.get(), existingFormElement, newFormElement);
        formElementBuilder
                .withName(formElementContract.getName())
                .withDisplayOrder(formElementContract.getDisplayOrder())
                .withIsVoided(formElementContract.isVoided())
                .withKeyValues(formElementContract.getKeyValues())
                .withType(formElementContract.getType())
                .withUUID(formElementContract.getUuid())
                .withMandatory(formElementContract.isMandatory())
                .withValidFormat(formElementContract.getValidFormat())
                .withRule(formElementContract.getRule())
                .withDeclarativeRule(formElementContract.getDeclarativeRule())
                .withConcept(existingConcept) //Concept should be in the end otherwise it may cause a flush on incomplete object causing JPA errors
                .build();
        formElementBuilder.linkWithFormElementGroup();
    }

    public FormElementGroupBuilder withoutFormElements(Organisation organisation, List<FormElementContract> formElementContracts) throws FormBuilderException {
        for (FormElementContract formElementContract : formElementContracts) {
            FormElement formElement = getFormElement(formElementContract);
            NonApplicableFormElementBuilder nonApplicableFormElementBuilder = new NonApplicableFormElementBuilder(formElement.getNonApplicable());
            nonApplicableFormElementBuilder.withOrganisation(organisation);
            nonApplicableFormElementBuilder.withFormElement(formElement);
            nonApplicableFormElementBuilder.withVoided(formElementContract.isVoided());
            formElement.setNonApplicable(nonApplicableFormElementBuilder.build());
            formElement.updateLastModifiedDateTime();
        }
        return this;
    }

    private FormElement getFormElement(FormElementContract formElementContract) throws FormBuilderException {
        FormElement formElement = get().findFormElement(formElementContract.getUuid());
        if (formElement == null) {
            throw new FormBuilderException(String.format("FormElement with uuid '%s' not found", formElementContract.getUuid()));
        }
        return formElement;
    }

}
