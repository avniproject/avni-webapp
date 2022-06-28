package org.avni.builder;

import org.avni.application.Form;
import org.avni.application.FormElementGroup;
import org.avni.application.FormType;
import org.avni.domain.Concept;
import org.avni.domain.DeclarativeRule;
import org.avni.domain.Organisation;
import org.avni.web.request.CHSRequest;
import org.avni.web.request.ConceptContract;
import org.avni.web.request.application.FormElementGroupContract;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class FormBuilder extends BaseBuilder<Form, FormBuilder> {
    public FormBuilder(Form existingForm) {
        super(existingForm, new Form());
    }

    public FormBuilder withType(String formType) {
        set(get()::setFormType, formType == null ? null : FormType.valueOf(formType));
        return this;
    }

    public FormBuilder withDecisionRule(String decisionRule) {
        this.get().setDecisionRule(decisionRule);
        return this;
    }

    public FormBuilder withVisitScheduleRule(String visitScheduleRule) {
        this.get().setVisitScheduleRule(visitScheduleRule);
        return this;
    }

    public FormBuilder withValidationRule(String validationRule) {
        this.get().setValidationRule(validationRule);
        return this;
    }

    public FormBuilder withChecklistRule(String checklistsRule) {
        this.get().setChecklistsRule(checklistsRule);
        return this;
    }

    public FormBuilder withName(String name) {
        this.set("Name", name, String.class);
        return this;
    }

    public FormBuilder withTimed(boolean isTimed) {
        this.get().setTimed(isTimed);
        return this;
    }

    public FormBuilder withVoided(boolean voided) {
        this.get().setVoided(voided);
        return this;
    }

    public FormBuilder withValidationDeclarativeRule(DeclarativeRule validationDeclarativeRule) {
        this.get().setValidationDeclarativeRule(validationDeclarativeRule);
        return this;
    }
    public FormBuilder withDecisionDeclarativeRule(DeclarativeRule decisionDeclarativeRule) {
        this.get().setDecisionDeclarativeRule(decisionDeclarativeRule);
        return this;
    }
    public FormBuilder withVisitScheduleDeclarativeRule(DeclarativeRule visitScheduleDeclarativeRule) {
        this.get().setVisitScheduleDeclarativeRule(visitScheduleDeclarativeRule);
        return this;
    }

    private FormElementGroup getExistingFormElementGroup(String uuid) {
        return this.get().findFormElementGroup(uuid);
    }

    public FormBuilder withFormElementGroups(List<FormElementGroupContract> formElementGroupsContract) throws FormBuilderException {
        for (FormElementGroupContract formElementGroupContract : formElementGroupsContract) {
            new FormElementGroupBuilder(this.get(), getExistingFormElementGroup(formElementGroupContract.getUuid()), new FormElementGroup())
                        .withName(formElementGroupContract.getName())
                        .withUUID(formElementGroupContract.getUuid())
                        .withStartTime(formElementGroupContract.getStartTime())
                        .withStayTime(formElementGroupContract.getStayTime())
                        .withDisplay(formElementGroupContract.getDisplay())
                        .withDisplayOrder(formElementGroupContract.getDisplayOrder())
                        .withRule(formElementGroupContract.getRule())
                        .withDeclarativeRule(formElementGroupContract.getDeclarativeRule())
                        .withIsVoided(formElementGroupContract.isVoided())
                        .makeFormElements(formElementGroupContract.getFormElements())
                        .build();
        }
        return this;
    }

    public FormBuilder withoutFormElements(Organisation organisation, List<FormElementGroupContract> formElementGroupContracts) throws FormBuilderException {
        List<String> formElementGroupUUIDs = formElementGroupContracts.stream()
                .map(CHSRequest::getUuid).collect(Collectors.toList());
        Set<FormElementGroup> formElementGroups = new HashSet<>();
        for (FormElementGroupContract formElementGroupContract : formElementGroupContracts) {
            formElementGroups.add(new FormElementGroupBuilder(this.get(), getExistingFormElementGroup(formElementGroupContract.getUuid()), new FormElementGroup())
                    .withoutFormElements(organisation, formElementGroupContract.getFormElements())
                    .build());
        }
        Set<FormElementGroup> allFormElementGroups = this.get().getFormElementGroups().stream()
                .filter(feg -> !formElementGroupUUIDs.contains(feg.getUuid())).collect(Collectors.toSet());
        allFormElementGroups.addAll(formElementGroups);
        return this;
    }
}
