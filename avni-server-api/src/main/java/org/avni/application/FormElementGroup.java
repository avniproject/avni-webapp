package org.avni.application;

import org.avni.domain.DeclarativeRule;
import org.hibernate.annotations.BatchSize;
import org.avni.domain.OrganisationAwareEntity;
import org.hibernate.annotations.Type;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "form_element_group")
@BatchSize(size = 100)
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

    @Column(name = "rule")
    private String rule;

    @Column(name = "declarative_rule")
    @Type(type = "declarativeRule")
    private DeclarativeRule declarativeRule;

    @Column
    private Long startTime;

    @Column
    private Long stayTime;

    public String getRule() {
        return rule;
    }

    public void setRule(String rule) {
        this.rule = rule;
    }

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

    FormElement findFormElementByConcept(String conceptName) {
        return formElements.stream().filter(x -> x.getConcept().getName().equals(conceptName)).findAny().orElse(null);
    }

    public FormElement findFormElement(String uuid) {
        return this.getFormElements().stream()
                .filter((formElement -> formElement.getUuid().equals(uuid)))
                .findFirst()
                .orElse(null);
    }

    public void addFormElement(FormElement formElement) {
        this.formElements.add(formElement);
    }

    public List<FormElement> getApplicableFormElements() {
        return this.getFormElements().stream().filter(formElement -> formElement.isApplicable()).collect(Collectors.toList());
    }

    public DeclarativeRule getDeclarativeRule() {
        return declarativeRule;
    }

    public void setDeclarativeRule(DeclarativeRule declarativeRule) {
        this.declarativeRule = declarativeRule;
    }

    public Long getStartTime() {
        return startTime;
    }

    public void setStartTime(Long startTime) {
        this.startTime = startTime;
    }

    public Long getStayTime() {
        return stayTime;
    }

    public void setStayTime(Long stayTime) {
        this.stayTime = stayTime;
    }
}
