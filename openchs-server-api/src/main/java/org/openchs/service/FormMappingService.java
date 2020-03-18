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
import org.openchs.web.request.webapp.CreateUpdateFormRequest;
import org.openchs.web.request.webapp.FormMappingRequest;
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
                              FormRepository formRepository,
                              ProgramRepository programRepository,
                              SubjectTypeRepository subjectTypeRepository,
                              FormRepository formRepository1) {
        this.formMappingRepository = formMappingRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.programRepository = programRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.formRepository = formRepository1;
    }

    public void createOrUpdateFormMapping(CreateUpdateFormRequest createUpdateFormRequest, Form form) {
        validateRequest(createUpdateFormRequest, form.getFormType());
        List<FormMapping> formMappings = formMappingRepository.findByFormId(form.getId());
        for (FormMappingRequest formMappingRequest : createUpdateFormRequest.getFormMappings()) {
            FormMapping formMapping = null;
            for (FormMapping fromMap : formMappings) {
                if (fromMap.getUuid().equals(formMappingRequest.getUuid())) {
                    formMapping = fromMap;
                }
            }

            if (formMapping == null) {
                formMapping = new FormMapping();
                formMapping.setUuid(formMappingRequest.getUuid());
                formMapping.setForm(form);
            }
            setSubjectTypeIfRequired(formMapping, formMappingRequest.getSubjectTypeUuid());
            setProgramNameIfRequired(formMapping, form.getFormType(), formMappingRequest.getProgramUuid());
            setEncounterTypeIfRequired(formMapping, form.getFormType(), formMappingRequest.getEncounterTypeUuid());
            formMapping.setVoided(formMappingRequest.getVoided());
            formMappingRepository.save(formMapping);
        }
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
        FormMapping formMapping = new FormMapping();
        Form form = new Form();
        formMapping.setUuid(formMappingRequest.getUuid());
        // form = formRepository.findByUuid(formMappingRequest.getFormUUID());
        formMapping.setForm(null);
        // formMapping.setUuid(formMappingRequest.getUuid());

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

        formMapping.setVoided(false);
        formMappingRepository.save(formMapping);
    }

    private void validateRequest(CreateUpdateFormRequest createUpdateFormRequest, FormType formType) {
        for (FormMappingRequest formMappingRequest : createUpdateFormRequest.getFormMappings()) {
            if (!formMappingRequest.getVoided()) {
                if (formType.isLinkedToEncounterType() && formMappingRequest.getEncounterTypeUuid() == null) {
                    throw new ApiException("Form of type %s must pass encounterType", formType);
                }

                if (formMappingRequest.getSubjectTypeUuid() == null) {
                    throw new ApiException("Subject type must be specified");
                }

                if (formType.isLinkedToProgram() && formMappingRequest.getProgramUuid() == null) {
                    throw new ApiException("Form of type %s must pass programName", formType);
                }
            }
        }
    }

    private void setEncounterTypeIfRequired(FormMapping formMapping, FormType formType, String requestEncounterType) {
        if (formType.isLinkedToEncounterType() && requestEncounterType != null) {
            EncounterType encounterType = encounterTypeRepository.findByUuid(requestEncounterType);
            //EncounterType encounterType = encounterTypeRepository.findByNameIgnoreCase(requestEncounterType);
            if (encounterType == null) throw new ApiException("Encounter Type %s not found", requestEncounterType);
            formMapping.setEncounterType(encounterType);
        }
    }

    private void setProgramNameIfRequired(FormMapping formMapping, FormType formType, String programName) {
        if (formType.isLinkedToProgram()) {
            Program program = programRepository.findByUuid(programName);
            //Program program = programRepository.findByNameIgnoreCase(programName);
            if (program == null) throw new ApiException("Program %s not found", programName);
            formMapping.setProgram(program);
        }
    }

    private void setSubjectTypeIfRequired(FormMapping formMapping, String requestSubjectType) {
        SubjectType subjectType = subjectTypeRepository.findByUuid(requestSubjectType);
        //SubjectType subjectType = subjectTypeRepository.findByNameIgnoreCase(requestSubjectType);
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