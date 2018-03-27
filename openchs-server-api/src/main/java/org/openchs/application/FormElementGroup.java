package org.openchs.application;

import org.openchs.domain.OrganisationAwareEntity;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "form_element_group")
public class FormElementGroup extends OrganisationAwareEntity {
    @NotNull
    private String name;

    @Column
    private String display;

    @NotNull
    private Double displayOrder;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "formElementGroup")
    private Set<FormElement> formElements = new HashSet<>();

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


    public Form getForm() {
        return form;
    }

    public void setForm(Form form) {
        this.form = form;
    }

    public Double getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Double displayOrder) {
        this.displayOrder = displayOrder;
    }

    public static FormElementGroup create() {
        FormElementGroup formElementGroup = new FormElementGroup();
        formElementGroup.formElements = new HashSet<>();
        return formElementGroup;
    }

    public String getDisplay() {
        return display;
    }

    public void setDisplay(String display) {
        this.display = display;
    }

    public FormElement findFormElementByConcept(String conceptName) {
        return formElements.stream().filter(x -> x.getConcept().getName().equals(conceptName)).findAny().orElse(null);
    }

    public void setFormElements(Set<FormElement> formElements) {
        this.formElements.clear();
        this.formElements.addAll(formElements);
    }

    public void addFormElements(Set<FormElement> formElements) {
        this.formElements.addAll(formElements);
    }
}