package org.avni.server.service;

import org.avni.server.application.*;
import org.avni.server.builder.FormBuilder;
import org.avni.server.builder.FormBuilderException;
import org.avni.server.dao.ConceptRepository;
import org.avni.server.dao.application.FormRepository;
import org.avni.server.domain.ConceptDataType;
import org.avni.server.web.request.application.FormContract;
import org.avni.server.web.request.application.FormElementContract;
import org.avni.server.web.request.application.FormElementGroupContract;
import org.springframework.stereotype.Service;

import org.joda.time.DateTime;
import java.util.ArrayList;
import java.util.HashSet;

@Service
public class FormService implements NonScopeAwareService {
    private final FormRepository formRepository;
    private final OrganisationConfigService organisationConfigService;
    private final ConceptRepository conceptRepository;

    public FormService(FormRepository formRepository, OrganisationConfigService organisationConfigService, ConceptRepository conceptRepository) {
        this.formRepository = formRepository;
        this.organisationConfigService = organisationConfigService;
        this.conceptRepository = conceptRepository;
    }

    public void saveForm(FormContract formRequest) throws FormBuilderException {
        Form existingForm = formRepository.findByUuid(formRequest.getUuid());
        FormBuilder formBuilder = new FormBuilder(existingForm);
        Form form = formBuilder.withName(formRequest.getName())
                .withType(formRequest.getFormType())
                .withUUID(formRequest.getUuid())
                .withFormElementGroups(formRequest.getFormElementGroups())
                .withDecisionRule(formRequest.getDecisionRule())
                .withVisitScheduleRule(formRequest.getVisitScheduleRule())
                .withTaskScheduleRule(formRequest.getTaskScheduleRule())
                .withValidationRule(formRequest.getValidationRule())
                .withChecklistRule(formRequest.getChecklistsRule())
                .withVoided(formRequest.isVoided())
                .withValidationDeclarativeRule(formRequest.getValidationDeclarativeRule())
                .withDecisionDeclarativeRule(formRequest.getDecisionDeclarativeRule())
                .withVisitScheduleDeclarativeRule(formRequest.getVisitScheduleDeclarativeRule())
                .withTaskScheduleDeclarativeRule(formRequest.getTaskScheduleDeclarativeRule())
                .build();

        mapDecisionConcepts(formRequest, form);
        //Form audit values might not change for changes in form element groups or form elements.
        //This updateAudit forces audit updates
        form.updateAudit();
        formRepository.save(form);
    }

    private void mapDecisionConcepts(FormContract formRequest, Form form) {
        formRequest.getDecisionConcepts().forEach(conceptContract -> {
            if (!form.hasDecisionConcept(conceptContract.getUuid())) {
                form.addDecisionConcept(conceptRepository.findByUuid(conceptContract.getUuid()));
            }
        });
        form.getDecisionConcepts().forEach(concept -> {
            if (formRequest.getDecisionConcepts().stream().filter(conceptContract -> conceptContract.getUuid().equals(concept.getUuid())).findFirst().orElse(null) == null) {
                form.removeDecisionConcept(concept);
            }
        });
    }

    public Form getOrCreateForm(String formUuid, String formName, FormType formType) {
        Form form = formRepository.findByUuid(formUuid);
        if (form != null) {
            return form;
        }

        form = Form.create();
        form.setName(formName);
        form.assignUUID();
        form.setFormType(formType);
        formRepository.save(form);
        return form;
    }

    public void checkIfLocationConceptsHaveBeenUsed(FormContract formRequest) {
        HashSet<String> locationConceptUuids = new HashSet<>();
        for (FormElementGroupContract formElementGroup : formRequest.getFormElementGroups()) {
            for (FormElementContract formElement : formElementGroup.getFormElements()) {
                if (formElement.getConcept().getDataType() != null && formElement.getConcept().getDataType().equals(String.valueOf(ConceptDataType.Location))) {
                    KeyValues keyValues = formElement.getConcept().getKeyValues();
                    if (keyValues != null && keyValues.containsKey(KeyType.lowestAddressLevelTypeUUIDs)) {
                        KeyValue isWithinCatchmentKeyValue = keyValues.get(KeyType.isWithinCatchment);
                        if (isWithinCatchmentKeyValue != null && !(boolean) isWithinCatchmentKeyValue.getValue()) {
                            locationConceptUuids.addAll((ArrayList<String>) keyValues.getKeyValue(KeyType.lowestAddressLevelTypeUUIDs).getValue());
                        }
                    }
                }
            }
        }
        if (!locationConceptUuids.isEmpty()) {
            organisationConfigService.updateLowestAddressLevelTypeSetting(locationConceptUuids);
        }
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return formRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}
