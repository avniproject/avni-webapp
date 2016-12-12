package org.openchs.application;

import org.hibernate.annotations.Type;
import org.openchs.domain.CHSEntity;
import org.openchs.domain.Concept;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "formElement")
public class FormElement extends CHSEntity {
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
    private boolean usedInSummary;

    @NotNull
    private boolean isGenerated;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_element_group_id")
    private FormElementGroup formElementGroup;

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
        return usedInSummary;
    }

    public void setUsedInSummary(boolean usedInSummary) {
        this.usedInSummary = usedInSummary;
    }

    public boolean isGenerated() {
        return isGenerated;
    }

    public void setGenerated(boolean generated) {
        isGenerated = generated;
    }
}