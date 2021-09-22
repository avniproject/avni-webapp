package org.openchs.application;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.openchs.domain.Concept;
import org.openchs.domain.OrganisationAwareEntity;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.*;
import java.util.stream.Collectors;

@Entity
@Table(name = "form")
public class Form extends OrganisationAwareEntity {
    @NotNull
    @Enumerated(EnumType.STRING)
    private FormType formType;

    // @NotNull
    private String name;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "form")
    private Set<FormElementGroup> formElementGroups = new HashSet<>();

    @Column(name = "decision_rule")
    private String decisionRule;

    @Column(name = "visit_schedule_rule")
    private String visitScheduleRule;

    @Column(name = "validation_rule")
    private String validationRule;

    @Column(name = "checklists_rule")
    private String checklistsRule;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "form")
    private Set<DecisionConcept> decisionConcepts = new HashSet<>();

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

    @JsonIgnore
    public List<FormElement> getAllCodedFormElements() {
        return getApplicableFormElements().stream().filter(fe -> fe.getConcept().isCoded()).collect(Collectors.toList());
    }

    public String getDecisionRule() {
        return decisionRule;
    }

    public void setDecisionRule(String decisionRule) {
        this.decisionRule = decisionRule;
    }

    public String getVisitScheduleRule() {
        return visitScheduleRule;
    }

    public void setVisitScheduleRule(String visitScheduleRule) {
        this.visitScheduleRule = visitScheduleRule;
    }

    public String getValidationRule() {
        return validationRule;
    }

    public void setValidationRule(String validationRule) {
        this.validationRule = validationRule;
    }

    public String getChecklistsRule() {
        return checklistsRule;

    }

    public void setChecklistsRule(String checklistsRule) {
        this.checklistsRule = checklistsRule;
    }

    public Set<Concept> getDecisionConcepts() {
        return this.decisionConcepts.stream().map(DecisionConcept::getConcept).collect(Collectors.toSet());
    }

    public void addDecisionConcept(Concept concept) {
        DecisionConcept decisionConcept = new DecisionConcept();
        decisionConcept.setConcept(concept);
        decisionConcept.setForm(this);
        this.decisionConcepts.add(decisionConcept);
    }

    public boolean hasDecisionConcept(String conceptUUID) {
        return getDecisionConcept(conceptUUID) != null;
    }

    private DecisionConcept getDecisionConcept(String conceptUUID) {
        return this.decisionConcepts.stream().filter(decisionConcept -> decisionConcept.getConcept().getUuid().equals(conceptUUID)).findFirst().orElse(null);
    }

    public void removeDecisionConcept(Concept concept) {
        DecisionConcept decisionConcept = getDecisionConcept(concept.getUuid());
        this.decisionConcepts.remove(decisionConcept);
    }
}
