package org.openchs.application;

import org.openchs.domain.CHSEntity;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.Set;

@Entity
@Table(name = "form")
public class Form extends CHSEntity {
    @NotNull
    @Enumerated(EnumType.STRING)
    private FormType formType;

    @NotNull
    private String name;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<FormElementGroup> formElementGroups;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<FormElementGroup> getFormElementGroups() {
        return formElementGroups;
    }

    public void setFormElementGroups(Set<FormElementGroup> formElementGroups) {
        this.formElementGroups = formElementGroups;
    }

    public FormType getFormType() {
        return formType;
    }

    public void setFormType(FormType formType) {
        this.formType = formType;
    }
}