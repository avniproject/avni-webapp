package org.openchs.builder;

import org.openchs.application.Form;
import org.openchs.application.FormElement;
import org.openchs.application.FormElementGroup;
import org.openchs.domain.Organisation;
import org.openchs.web.request.CHSRequest;
import org.openchs.web.request.application.FormElementContract;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class FormElementGroupBuilder extends BaseBuilder<FormElementGroup, FormElementGroupBuilder> {

    public FormElementGroupBuilder(Form form, FormElementGroup existingFormElementGroup) {
        super(existingFormElementGroup, new FormElementGroup());
        this.get().setForm(form);
    }

    public FormElementGroupBuilder withName(String name) {
        this.set("Name", name, String.class);
        return this;
    }

    public FormElementGroupBuilder withDisplayOrder(Double displayOrder) {
        this.set("DisplayOrder", displayOrder, Double.class);
        return this;
    }

    public FormElementGroupBuilder withDisplay(String display) {
        this.set("Display", display, String.class);
        return this;
    }

    private FormElement getExistingFormElement(String uuid) {
        return this.get().getFormElements().stream()
                .filter((formElement -> formElement.getUuid().equals(uuid)))
                .findFirst()
                .orElse(null);
    }

    private Set<FormElement> makeFormElements(List<FormElementContract> formElementContracts) {
        return formElementContracts.stream().map(formElementContract -> {
            FormElement existingFormElement = getExistingFormElement(formElementContract.getUuid());
            FormElementBuilder formElementBuilder = new FormElementBuilder(this.get(), existingFormElement);
            return formElementBuilder
                    .withConcept(formElementContract.getConcept())
                    .withName(formElementContract.getName())
                    .withDisplayOrder(formElementContract.getDisplayOrder())
                    .withKeyValues(formElementContract.getKeyValues())
                    .withType(formElementContract.getType())
                    .withUUID(formElementContract.getUuid())
                    .withMandatory(formElementContract.isMandatory())
                    .build();
        }).collect(Collectors.toSet());
    }

    public FormElementGroupBuilder withFormElements(List<FormElementContract> formElementContracts) {
        Set<FormElement> formElements = makeFormElements(formElementContracts);
        this.get().setFormElements(formElements);
        return this;
    }

    public FormElementGroupBuilder addFormElements(List<FormElementContract> formElementContracts) {
        Set<FormElement> formElements = makeFormElements(formElementContracts);
        this.get().addFormElements(formElements);
        return this;
    }

    public FormElementGroupBuilder withoutFormElements(Organisation organisation, List<FormElementContract> formElementContracts) {
        List<String> formElementUUIDs = formElementContracts.stream().map(CHSRequest::getUuid).collect(Collectors.toList());
        Set<FormElement> formElements = this.get().getFormElements().stream().map((formElement -> {
            if (formElementUUIDs.contains(formElement.getUuid())) {
                formElement.addNonApplicableOrganisations(organisation);
            }
            return formElement;
        })).collect(Collectors.toSet());
        this.get().setFormElements(formElements);
        return this;
    }
}
