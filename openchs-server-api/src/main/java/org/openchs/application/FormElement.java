package org.openchs.application;

import org.hibernate.annotations.Type;
import org.openchs.domain.Concept;
import org.openchs.domain.OrganisationAwareEntity;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "form_element")
public class FormElement extends OrganisationAwareEntity {
    @NotNull
    private String name;

    @NotNull
    private short displayOrder;

    @NotNull
    private boolean isMandatory;

    @Column
    @Type(type = "keyValues")
    private KeyValues keyValues;

    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    @JoinColumn(name = "concept_id")
    private Concept concept;

    @NotNull
    private boolean isUsedInSummary;

    @NotNull
    private boolean isGenerated;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_element_group_id")
    private FormElementGroup formElementGroup;

    @Column(name = "type", nullable = true)
    private String type;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public short getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(short displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Concept getConcept() {
        return concept;
    }

    public void setConcept(Concept concept) {
        this.concept = concept;
    }

    public KeyValues getKeyValues() {
        return keyValues;
    }

    public void setKeyValues(KeyValues keyValues) {
        this.keyValues = keyValues;
    }

    public boolean isMandatory() {
        return isMandatory;
    }

    public void setMandatory(boolean mandatory) {
        isMandatory = mandatory;
    }

    public boolean isUsedInSummary() {
        return isUsedInSummary;
    }

    public void setUsedInSummary(boolean usedInSummary) {
        this.isUsedInSummary = usedInSummary;
    }

    public boolean isGenerated() {
        return isGenerated;
    }

    public void setGenerated(boolean generated) {
        isGenerated = generated;
    }

    public FormElementGroup getFormElementGroup() {
        return formElementGroup;
    }

    public void setFormElementGroup(FormElementGroup formElementGroup) {
        this.formElementGroup = formElementGroup;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean isFormElementNameSameAsConceptName() {
        return getConcept().getName().equals(getName());
    }
}