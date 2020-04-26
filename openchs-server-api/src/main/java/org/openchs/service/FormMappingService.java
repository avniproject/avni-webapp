package org.openchs.service;

import org.openchs.application.Form;
import org.openchs.application.FormElement;
import org.openchs.application.FormMapping;
import org.openchs.application.FormType;
import org.openchs.dao.EncounterTypeRepository;
import org.openchs.dao.ProgramRepository;
import org.openchs.dao.SubjectTypeRepository;
import org.openchs.dao.application.FormMappingRepository;
import org.openchs.dao.application.FormRepository;
import org.openchs.domain.EncounterType;
import org.openchs.domain.Program;
import org.openchs.domain.SubjectType;
import org.openchs.util.ApiException;
import org.openchs.web.request.FormMappingContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FormMappingService {

    private final ProgramRepository programRepository;
    private SubjectTypeRepository subjectTypeRepository;
    private FormMappingRepository formMappingRepository;
    private EncounterTypeRepository encounterTypeRepository;
    private FormRepository formRepository;

    @Autowired
    public FormMappingService(FormMappingRepository formMappingRepository,
                              EncounterTypeRepository encounterTypeRepository,
                              ProgramRepository programRepository,
                              SubjectTypeRepository subjectTypeRepository,
                              FormRepository formRepository) {
        this.formMappingRepository = formMappingRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.programRepository = programRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.formRepository = formRepository;
    }

    public void saveFormMapping(FormMappingParameterObject parametersForNewMapping,
                                FormMappingParameterObject mappingsToVoid,
                                Form form) {
        voidExistingFormMappings(mappingsToVoid, form);

        saveMatchingFormMappings(parametersForNewMapping, form);
    }

    private void voidExistingFormMappings(FormMappingParameterObject mappingsToVoid, Form form) {
        List<FormMapping> formMappingsToVoid = formMappingRepository.findRequiredFormMappings(
                mappingsToVoid.subjectTypeUuid,
                mappingsToVoid.programUuid,
                mappingsToVoid.encounterTypeUuid,
                form.getFormType()
        );

        formMappingsToVoid.forEach(formMapping -> formMapping.setVoided(true));
        formMappingsToVoid.forEach(formMapping -> formMappingRepository.save(formMapping));
    }

    private void saveMatchingFormMappings(FormMappingParameterObject parametersForNewMapping, Form form) {
        FormMapping formMapping = formMappingRepository.getRequiredFormMapping(
                parametersForNewMapping.subjectTypeUuid,
                parametersForNewMapping.programUuid,
                parametersForNewMapping.encounterTypeUuid,
                form.getFormType());
        if (formMapping == null) {
            formMapping = new FormMapping();
            formMapping.assignUUID();
            formMapping.setVoided(false);
        }

        setSubjectTypeIfRequired(formMapping, parametersForNewMapping.subjectTypeUuid);
        setProgramIfRequired(formMapping, form.getFormType(), parametersForNewMapping.programUuid);
        setEncounterTypeIfRequired(formMapping, form.getFormType(), parametersForNewMapping.encounterTypeUuid);
        formMapping.setForm(form);

        formMappingRepository.save(formMapping);
    }

    public void createOrUpdateFormMapping(FormMappingContract formMappingRequest) {

        if (formMappingRequest.getFormUUID() == null) {
            throw new RuntimeException("FormMappingRequest without form uuid! " + formMappingRequest);
        }
        Form form = formRepository.findByUuid(formMappingRequest.getFormUUID());
        if (form == null) {
            throw new RuntimeException("Form not found!" + formMappingRequest);
        }
        FormMapping formMapping = formMappingRepository.findByUuid(formMappingRequest.getUuid());
        if (formMapping == null) {
            formMapping = new FormMapping();
            formMapping.setUuid(formMappingRequest.getUuid());
        }
        formMapping.setForm(form);

        if (formMappingRequest.getProgramUUID() != null) {
            formMapping.setProgram(programRepository.findByUuid(formMappingRequest.getProgramUUID()));
        }

        if (formMappingRequest.getEncounterTypeUUID() != null) {
            formMapping.setEncounterType(encounterTypeRepository.findByUuid(formMappingRequest.getEncounterTypeUUID()));
        }

        if (formMappingRequest.getSubjectTypeUUID() != null) {
            formMapping.setSubjectType(
                    subjectTypeRepository.findByUuid(
                            formMappingRequest.getSubjectTypeUUID()));
        } else {
            formMapping.setSubjectType(subjectTypeRepository.individualSubjectType());
        }

        formMapping.setVoided(formMappingRequest.isVoided());
        formMappingRepository.save(formMapping);
    }

    public void createOrUpdateEmptyFormMapping(FormMappingContract formMappingRequest) {
        FormMapping formMapping = formMappingRepository.findByUuid(formMappingRequest.getUuid());
        if (formMapping == null) {
            formMapping = new FormMapping();
            formMapping.setUuid(formMappingRequest.getUuid());
        }

        Form form =  null;
        if (formMappingRequest.getFormUUID() != null) {
            form =  formRepository.findByUuid(formMappingRequest.getFormUUID());
        }
        formMapping.setForm(form);

        if (formMappingRequest.getProgramUUID() != null) {
            formMapping.setProgram(programRepository.findByUuid(formMappingRequest.getProgramUUID()));
        }
        else{
            formMapping.setProgram(null);
        }

        if (formMappingRequest.getEncounterTypeUUID() != null) {
            formMapping.setEncounterType(encounterTypeRepository.findByUuid(formMappingRequest.getEncounterTypeUUID()));
        }
        else{
            formMapping.setEncounterType(null);
        }

        if (formMappingRequest.getSubjectTypeUUID() != null) {
            formMapping.setSubjectType(
                    subjectTypeRepository.findByUuid(
                            formMappingRequest.getSubjectTypeUUID()));
        } else {
            formMapping.setSubjectType(null);
        }

        formMapping.setVoided(formMappingRequest.getIsVoided());
        formMappingRepository.save(formMapping);
    }

    private void setEncounterTypeIfRequired(FormMapping formMapping, FormType formType, String encounterTypeUuid) {
        if (formType.isLinkedToEncounterType() && encounterTypeUuid != null) {
            EncounterType encounterType = encounterTypeRepository.findByUuid(encounterTypeUuid);
            if (encounterType == null) throw new ApiException("Encounter Type %s not found", encounterTypeUuid);
            formMapping.setEncounterType(encounterType);
        }
    }

    private void setProgramIfRequired(FormMapping formMapping, FormType formType, String programUuid) {
        if (formType.isLinkedToProgram()) {
            Program program = programRepository.findByUuid(programUuid);
            formMapping.setProgram(program);
        }
    }

    private void setSubjectTypeIfRequired(FormMapping formMapping, String requestSubjectType) {
        SubjectType subjectType = subjectTypeRepository.findByUuid(requestSubjectType);
        if (subjectType == null) throw new ApiException("Subject type %s not found", requestSubjectType);
        formMapping.setSubjectType(subjectType);
    }

    @Transactional(readOnly = true)
    public LinkedHashMap<String, FormElement> getFormMapping(String subjectTypeUUID, String programUUID, String encounterTypeUUID, FormType formType) {
        return getEntityConceptMap(formMappingRepository.getRequiredFormMapping(subjectTypeUUID, programUUID, encounterTypeUUID, formType));
    }

    private LinkedHashMap<String, FormElement> getEntityConceptMap(FormMapping formMapping) {
        List<FormElement> formElements = formMapping == null ? Collections.emptyList() : formMapping.getForm().getApplicableFormElements();
        return formElements.stream().collect(Collectors.toMap(f -> f.getConcept().getUuid(), f -> f, (a, b) -> b, LinkedHashMap::new));
    }

}
