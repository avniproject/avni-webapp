package org.openchs.builder;

import org.openchs.application.Form;
import org.openchs.application.FormElement;
import org.openchs.application.FormElementGroup;
import org.openchs.domain.Concept;
import org.openchs.domain.Organisation;
import org.openchs.framework.ApplicationContextProvider;
import org.openchs.service.ConceptService;
import org.openchs.web.request.CHSRequest;
import org.openchs.web.request.application.FormElementContract;

import java.util.List;
import java.util.stream.Collectors;

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

    private FormElement getExistingFormElement(String uuid) {
        return this.get().findFormElement(uuid);
    }

    private Concept getExistingConcept(String uuid, FormElement formElement) {
        return formElement.getConcept() != null && formElement.getConcept().getUuid().equals(uuid) ?
                formElement.getConcept() : conceptService.get(uuid);
    }

    public FormElementGroupBuilder makeFormElements(List<FormElementContract> formElementContracts) {
        formElementContracts.stream().forEach(formElementContract -> {
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
                    .withConcept(existingConcept, formElementContract.getConcept()) //Concept should be in the end otherwise it may cause a flush on incomplete object causing JPA errors
                    .build();
            formElementBuilder.linkWithFormElementGroup();
        });
        return this;
    }

    public FormElementGroupBuilder withoutFormElements(Organisation organisation, List<FormElementContract> formElementContracts) {
        List<String> formElementUUIDs = formElementContracts.stream().map(CHSRequest::getUuid).collect(Collectors.toList());
        this.get().getFormElements().stream().map((formElement -> {
            if (formElementUUIDs.contains(formElement.getUuid())) {
                formElement.addNonApplicableOrganisations(organisation);
            }
            return formElement;
        })).collect(Collectors.toSet());
        return this;
    }
}
