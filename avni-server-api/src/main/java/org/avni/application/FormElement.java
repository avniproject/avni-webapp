package org.avni.application;

import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Type;
import org.joda.time.DateTime;
import org.avni.common.ValidationResult;
import org.avni.domain.Concept;
import org.avni.domain.OrganisationAwareEntity;
import org.avni.web.validation.ValidationException;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

@Entity
@Table(name = "form_element")
@BatchSize(size = 100)
public class FormElement extends OrganisationAwareEntity {
    public static final String SINGLE_SELECT = "SingleSelect";
    public static final Pattern PLACEHOLDER_CONCEPT_NAME = Pattern.compile("Placeholder.*");
    public static final String PLACEHOLDER_CONCEPT_UUID = "b4e5a662-97bf-4846-b9b7-9baeab4d89c4";

    @NotNull
    private String name;

    @NotNull
    private Double displayOrder;

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
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_element_group_id")
    private FormElementGroup formElementGroup;

    @Column(name = "type", nullable = true)
    private String type;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "formElement")
    private Set<NonApplicableFormElement> nonApplicableFormElements = null;

    @Embedded
    private Format validFormat;

    @Column(name = "rule")
    private String rule;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Double displayOrder) {
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

    public void setKeyValues(KeyValues newKeyValues) {
        this.keyValues = newKeyValues;
    }

    public boolean isMandatory() {
        return isMandatory;
    }

    public void setMandatory(boolean mandatory) {
        isMandatory = mandatory;
    }

    public void setMandatory(Boolean mandatory) {
        isMandatory = mandatory;
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

    public Format getValidFormat() {
        return validFormat;
    }

    public void setValidFormat(Format validFormat) {
        this.validFormat = validFormat;
    }

    public boolean isSingleSelect() {
        return SINGLE_SELECT.equals(this.type);
    }

    public DateTime getLastModifiedDateTime() {
        NonApplicableFormElement nonApplicable = getNonApplicable();
        return nonApplicable != null && nonApplicable.getLastModifiedDateTime().isAfter(super.getLastModifiedDateTime()) ?
                nonApplicable.getLastModifiedDateTime() : super.getLastModifiedDateTime();
    }

    public Set<NonApplicableFormElement> getNonApplicableFormElements() {
        if (nonApplicableFormElements == null) {
            nonApplicableFormElements = new HashSet<>();
        }
        return nonApplicableFormElements;
    }

    public NonApplicableFormElement getNonApplicable() {
        return getNonApplicableFormElements().stream().findFirst().orElse(null);
    }

    public void setNonApplicable(NonApplicableFormElement nonApplicable) {
        getNonApplicableFormElements().add(nonApplicable);
    }

    public boolean isVoided() {
        if (super.isVoided()) {
            return true;
        }
        return getNonApplicable() != null && !getNonApplicable().isVoided();
    }

    public List<ValidationResult> validate() {
        ArrayList<ValidationResult> validationResults = new ArrayList<>();
        if (this.getType() != null && !this.getType().trim().isEmpty()) {
            try {
                FormElementType.valueOf(this.getType());
            } catch (IllegalArgumentException | NullPointerException e) {
                throw new ValidationException(String.format("%s - is not a valid form element type, for form element: %s", this.getType(), this.toString()));
            }
        }
        return validationResults;
    }

    @Override
    public String toString() {
        return "FormElement{" +
                "name='" + name + '\'' +
                "uuid='" + this.getUuid() + '\'' +
                '}';
    }

    public boolean isApplicable() {
        return this.getNonApplicableFormElements().isEmpty();
    }

    public String getRule() {
        return rule;
    }

    public void setRule(String rule) {
        this.rule = rule;
    }
}
