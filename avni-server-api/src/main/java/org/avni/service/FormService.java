package org.avni.service;

import org.avni.application.Form;
import org.avni.application.FormType;
import org.avni.application.KeyType;
import org.avni.builder.FormBuilder;
import org.avni.builder.FormBuilderException;
import org.avni.dao.ConceptRepository;
import org.avni.dao.application.FormRepository;
import org.avni.domain.Concept;
import org.avni.domain.ConceptDataType;
import org.avni.web.request.application.FormContract;
import org.avni.web.request.application.FormElementContract;
import org.avni.web.request.application.FormElementGroupContract;
import org.springframework.stereotype.Service;

import org.joda.time.DateTime;
import java.util.ArrayList;
import java.util.HashSet;

@Service
public class FormService implements NonScopeAwareService {

    private FormRepository formRepository;
    private OrganisationConfigService organisationConfigService;
    private ConceptRepository conceptRepository;

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
                .withTimed(formRequest.isTimed())
                .withFormElementGroups(formRequest.getFormElementGroups())
                .withDecisionRule(formRequest.getDecisionRule())
                .withVisitScheduleRule(formRequest.getVisitScheduleRule())
                .withValidationRule(formRequest.getValidationRule())
                .withChecklistRule(formRequest.getChecklistsRule())
                .withVoided(formRequest.isVoided())
                .withValidationDeclarativeRule(formRequest.getValidationDeclarativeRule())
                .withDecisionDeclarativeRule(formRequest.getDecisionDeclarativeRule())
                .withVisitScheduleDeclarativeRule(formRequest.getVisitScheduleDeclarativeRule())
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
                    Concept locationConcept = conceptRepository.findByUuid(formElement.getConcept().getUuid());
                    locationConceptUuids.addAll((ArrayList<String>)locationConcept.getKeyValues().getKeyValue(KeyType.lowestAddressLevelTypeUUIDs).getValue());
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
