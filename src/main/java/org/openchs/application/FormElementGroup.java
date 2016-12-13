package org.openchs.application;

import org.openchs.domain.CHSEntity;
import org.openchs.domain.Individual;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.Set;

@Entity
@Table(name = "formElementGroup")
public class FormElementGroup extends CHSEntity {
    @NotNull
    private String name;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<FormElement> formElements;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id")
    private Form form;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<FormElement> getFormElements() {
        return formElements;
    }

    public void setFormElements(Set<FormElement> formElements) {
        this.formElements = formElements;
    }

    public Form getForm() {
        return form;
    }

    public void setForm(Form form) {
        this.form = form;
    }
}