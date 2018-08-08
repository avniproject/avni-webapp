package org.openchs.builder;

import org.openchs.application.FormElement;
import org.openchs.application.NonApplicableFormElement;
import org.openchs.domain.Organisation;

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
