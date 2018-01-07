package org.openchs.application;

import org.openchs.domain.OrganisationAwareEntity;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "form_element_group")
public class FormElementGroup extends OrganisationAwareEntity {
    @NotNull
    private String name;

    @Column
    private String display;

    @NotNull
    private short displayOrder;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "formElementGroup")
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

    public short getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(short displayOrder) {
        this.displayOrder = displayOrder;
    }

    public void clearElements() {
        this.formElements.clear();
    }

    public static FormElementGroup create() {
        FormElementGroup formElementGroup = new FormElementGroup();
        formElementGroup.formElements = new HashSet<>();
        return formElementGroup;
    }

    public FormElement findFormElement(String uuid) {
        return formElements.stream().filter(x -> x.getUuid().equals(uuid)).findAny().orElse(null);
    }

    public FormElement addFormElement(String formElementUUID) {
        FormElement formElement = new FormElement();
        if (formElementUUID == null) {
            formElement.assignUUID();
        } else {
            formElement.setUuid(formElementUUID);
        }
        formElements.add(formElement);
        formElement.setFormElementGroup(this);
        return formElement;
    }

    public void removeFormElements(List<String> formElementUUIDs) {
        List<FormElement> orphanedFormElements = getFormElements().stream().filter(formElement -> !formElementUUIDs.contains(formElement.getUuid())).collect(Collectors.toList());
        formElements.removeAll(orphanedFormElements);
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
}