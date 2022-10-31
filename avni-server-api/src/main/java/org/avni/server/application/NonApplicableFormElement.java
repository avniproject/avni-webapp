package org.avni.server.application;

import org.avni.server.domain.OrganisationAwareEntity;
import org.hibernate.annotations.BatchSize;

import javax.persistence.*;

@Entity
@Table(name = "non_applicable_form_element")
@BatchSize(size = 100)
public class NonApplicableFormElement extends OrganisationAwareEntity {
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "form_element_id")
    private FormElement formElement;

    public FormElement getFormElement() {
        return formElement;
    }

    public void setFormElement(FormElement formElement) {
        this.formElement = formElement;
    }
}
