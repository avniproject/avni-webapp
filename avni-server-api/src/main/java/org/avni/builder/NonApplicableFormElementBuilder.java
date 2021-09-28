package org.avni.builder;

import org.avni.application.FormElement;
import org.avni.application.NonApplicableFormElement;
import org.avni.domain.Organisation;

public class NonApplicableFormElementBuilder extends BaseBuilder<NonApplicableFormElement, NonApplicableFormElementBuilder> {
    public NonApplicableFormElementBuilder(NonApplicableFormElement existingEntity) {
        super(existingEntity, new NonApplicableFormElement());
        get().assignUUIDIfRequired();
    }

    public void withOrganisation(Organisation organisation) {
        get().setOrganisationId(organisation.getId());
    }

    public void withFormElement(FormElement formElement) {
        get().setFormElement(formElement);
    }

    public void withVoided(boolean voided) {
        get().setVoided(voided);
    }
}
