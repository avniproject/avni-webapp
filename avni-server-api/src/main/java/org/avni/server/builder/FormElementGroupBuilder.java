package org.avni.server.builder;

import org.avni.server.application.Form;
import org.avni.server.application.FormElement;
import org.avni.server.application.FormElementGroup;
import org.avni.server.domain.*;
import org.avni.server.framework.ApplicationContextProvider;
import org.avni.server.service.ConceptService;
import org.avni.server.service.DocumentationService;
import org.avni.server.web.request.application.FormElementContract;
import org.avni.server.web.request.application.FormElementGroupContract;

import java.util.List;

public class FormElementGroupBuilder extends BaseBuilder<FormElementGroup, FormElementGroupBuilder> {
    private final ConceptService conceptService;
    private final DocumentationService documentationService;

    public FormElementGroupBuilder(Form form, FormElementGroup existingFormElementGroup, FormElementGroup newFormElementGroup, ConceptService conceptService, DocumentationService documentationService) {
        super(existingFormElementGroup, newFormElementGroup);
        this.get().setForm(form);
        if (existingFormElementGroup == null)
            form.addFormElementGroup(newFormElementGroup);
        this.conceptService = conceptService;
        this.documentationService = documentationService;
    }

    public FormElementGroupBuilder(Form form, FormElementGroup existingFormElementGroup, FormElementGroup newFormElementGroup) {
        this(form, existingFormElementGroup, newFormElementGroup,
                ApplicationContextProvider.getContext().getBean(ConceptService.class), ApplicationContextProvider.getContext().getBean(DocumentationService.class));
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

    public FormElementGroupBuilder withTimed(boolean isTimed) {
        this.get().setTimed(isTimed);
        return this;
    }

    public FormElementGroupBuilder withTextColour(String textColour) {
        this.get().setTextColour(textColour);
        return this;
    }

    public FormElementGroupBuilder withBackgroundColour(String backgroundColour) {
        this.get().setBackgroundColour(backgroundColour);
        return this;
    }


    public FormElementGroupBuilder withStartTime(Long startTime) {
        this.get().setStartTime(startTime);
        return this;
    }

    public FormElementGroupBuilder withStayTime(Long stayTime) {
        this.get().setStayTime(stayTime);
        return this;
    }

    public FormElementGroupBuilder withDeclarativeRule(DeclarativeRule declarativeRule) {
        this.get().setDeclarativeRule(declarativeRule);
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

    public FormElementGroupBuilder makeFormElements(FormElementGroupContract formElementGroupContract) throws FormBuilderException {
        List<FormElementContract> formElementContracts = formElementGroupContract.getFormElements();
        for (FormElementContract formElementContract : formElementContracts) {
            makeFormElement(formElementContract, formElementGroupContract);
        }
        return this;
    }

    private Documentation getDocumentation(JsonObject documentationOption) {
        if (documentationOption == null) return null;
        return documentationService.get((String) documentationOption.get("value"));
    }

    private FormElement makeFormElement(FormElementContract formElementContract, FormElementGroupContract formElementGroupContract) throws FormBuilderException {
        FormElement existingFormElement = getExistingFormElement(formElementContract.getUuid());
        FormElement newFormElement = new FormElement();
        Concept existingConcept = getExistingConcept(formElementContract.getConcept().getUuid(), existingFormElement == null ? newFormElement : existingFormElement);
        FormElementBuilder formElementBuilder = new FormElementBuilder(this.get(), existingFormElement, newFormElement);
        FormElement formElement = formElementBuilder
                .withName(formElementContract.getName())
                .withDisplayOrder(formElementContract.getDisplayOrder())
                .withIsVoided(formElementContract.isVoided(), formElementGroupContract.isVoided())
                .withKeyValues(formElementContract.getKeyValues())
                .withType(formElementContract.getType())
                .withUUID(formElementContract.getUuid())
                .withMandatory(formElementContract.isMandatory())
                .withValidFormat(formElementContract.getValidFormat())
                .withRule(formElementContract.getRule())
                .withDeclarativeRule(formElementContract.getDeclarativeRule())
                .withGroup(this.getQuestionGroup(formElementContract))
                .withDocumentation(getDocumentation(formElementContract.getDocumentation()))
                .withConcept(existingConcept) //Concept should be in the end otherwise it may cause a flush on incomplete object causing JPA errors
                .build();
        formElementBuilder.linkWithFormElementGroup();
        return formElement;
    }

    private FormElement getQuestionGroup(FormElementContract formElementContract) throws FormBuilderException {
        FormElement group = null;
        if (formElementContract.getParentFormElementUuid() != null) {
            group = getExistingFormElement(formElementContract.getParentFormElementUuid());
            if (group == null) {
                throw new FormBuilderException(String.format("Parent form element with uuid '%s' not found", formElementContract.getParentFormElementUuid()));
            }
        }
        return group;
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
