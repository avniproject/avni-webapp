package org.openchs.application;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.google.common.collect.Lists;
import org.openchs.domain.OrganisationAwareEntity;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.text.Normalizer;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Entity
@Table(name = "form")
public class Form extends OrganisationAwareEntity {
    @NotNull
    @Enumerated(EnumType.STRING)
    private FormType formType;

    @NotNull
    private String name;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "form")
    private Set<FormElementGroup> formElementGroups = new HashSet<>();

    public Form() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<FormElementGroup> getFormElementGroups() {
        return formElementGroups;
    }

    public FormType getFormType() {
        return formType;
    }

    public void setFormType(FormType formType) {
        this.formType = formType;
    }

    public static Form create() {
        Form form = new Form();
        form.formElementGroups = new HashSet<>();
        return form;
    }

    public FormElementGroup addFormElementGroup(FormElementGroup formElementGroup) {
        this.formElementGroups.add(formElementGroup);
        if (formElementGroup.getUuid() == null) {
            formElementGroup.assignUUID();
        }
        return formElementGroup;
    }

    public FormElementGroup findFormElementGroup(String uuid) {
        return formElementGroups.stream().filter(x -> x.getUuid().equals(uuid)).findAny().orElse(null);
    }

    @JsonIgnore
    public List<FormElement> getAllFormElements() {
        return formElementGroups.stream()
                .sorted(Comparator.comparing(FormElementGroup::getDisplayOrder))
                .map(FormElementGroup::getFormElements)
                .map(x -> x.stream().sorted(Comparator.comparing(FormElement::getDisplayOrder)))
                .map(x -> x.collect(Collectors.toList()))
                .flatMap(List::stream)
                .collect(Collectors.toList());
    }

    @JsonIgnore
    public List<FormElement> getApplicableFormElements() {
        return getAllFormElements().stream().filter(fe->!fe.isVoided()).collect(Collectors.toList());
    }

}