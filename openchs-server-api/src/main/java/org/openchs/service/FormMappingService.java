package org.openchs.service;

import org.openchs.application.Form;
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
import org.openchs.web.request.webapp.CreateUpdateFormRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FormMappingService {

    private final ProgramRepository programRepository;
    private SubjectTypeRepository subjectTypeRepository;
    private FormMappingRepository formMappingRepository;
    private EncounterTypeRepository encounterTypeRepository;

    @Autowired
    public FormMappingService(FormMappingRepository formMappingRepository,
                              EncounterTypeRepository encounterTypeRepository,
                              FormRepository formRepository,
                              ProgramRepository programRepository,
                              SubjectTypeRepository subjectTypeRepository
    ) {
        this.formMappingRepository = formMappingRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.programRepository = programRepository;
        this.subjectTypeRepository = subjectTypeRepository;
    }

    public void updateFormMapping(CreateUpdateFormRequest createUpdateFormRequest, Form form) {
        validateRequest(createUpdateFormRequest, form.getFormType());
        List<FormMapping> formMappings = formMappingRepository.findByFormId(form.getId());
        if (formMappings.size() == 1) {
            FormMapping formMapping = formMappings.get(0);
            setSubjectTypeIfRequired(formMapping, createUpdateFormRequest.getSubjectType());
            setProgramNameIfRequired(formMapping, form.getFormType(), createUpdateFormRequest.getProgramName());
            setEncounterTypeIfRequired(formMapping, form.getFormType(), createUpdateFormRequest.getEncounterType());
            formMappingRepository.save(formMapping);
        } else {
            throw new RuntimeException(String.format("There should have been only one form mapping for %s", form.getName()));
        }
    }

    public void createFormMapping(CreateUpdateFormRequest createUpdateFormRequest, Form form) {
        FormType formType = form.getFormType();
        if (formType == FormType.ChecklistItem)
            return;
        validateRequest(createUpdateFormRequest, formType);
        FormMapping formMapping = new FormMapping();
        formMapping.assignUUID();
        formMapping.setForm(form);
        setSubjectTypeIfRequired(formMapping, createUpdateFormRequest.getSubjectType());
        setProgramNameIfRequired(formMapping, form.getFormType(), createUpdateFormRequest.getProgramName());
        setEncounterTypeIfRequired(formMapping, form.getFormType(), createUpdateFormRequest.getEncounterType());
        formMappingRepository.save(formMapping);
    }

    private void validateRequest(CreateUpdateFormRequest createUpdateFormRequest, FormType formType) {
        if (formType.isLinkedToEncounterType() && createUpdateFormRequest.getEncounterType() == null) {
            throw new ApiException("Form of type %s must pass encounterType", formType);
        }

        if (createUpdateFormRequest.getSubjectType() == null) {
            throw new ApiException("Subject type must be specified");
        }

        if (formType.isLinkedToProgram() && createUpdateFormRequest.getProgramName() == null) {
            throw new ApiException("Form of type %s must pass programName", formType);
        }
    }

    private void createFormMapping(Form form, String subjectType, String programName, String encounterType) {
        FormMapping formMapping = new FormMapping();
        formMapping.assignUUID();
        formMapping.setForm(form);
        setSubjectTypeIfRequired(formMapping, subjectType);
        setProgramNameIfRequired(formMapping, form.getFormType(), programName);
        setEncounterTypeIfRequired(formMapping, form.getFormType(), encounterType);
        formMappingRepository.save(formMapping);
    }

    private void updateFormMapping(FormMapping formMapping, FormType formType, String subjectType, String programName, String encounterType) {
        setSubjectTypeIfRequired(formMapping, subjectType);
        setProgramNameIfRequired(formMapping, formType, programName);
        setEncounterTypeIfRequired(formMapping, formType, encounterType);
        formMappingRepository.save(formMapping);
    }


    private void setEncounterTypeIfRequired(FormMapping formMapping, FormType formType, String requestEncounterType) {
        if (formType.isLinkedToEncounterType() && requestEncounterType != null) {
            EncounterType encounterType = encounterTypeRepository.findByNameIgnoreCase(requestEncounterType);
            if (encounterType == null) throw new ApiException("Encounter Type %s not found", requestEncounterType);
            formMapping.setEncounterType(encounterType);
        }
    }

    private void setProgramNameIfRequired(FormMapping formMapping, FormType formType, String programName) {
        if (formType.isLinkedToProgram()) {
            Program program = programRepository.findByNameIgnoreCase(programName);
            if (program == null) throw new ApiException("Program %s not found", programName);
            formMapping.setProgram(program);
        }
    }

    private void setSubjectTypeIfRequired(FormMapping formMapping, String requestSubjectType) {
        SubjectType subjectType = subjectTypeRepository.findByNameIgnoreCase(requestSubjectType);
        if (subjectType == null) throw new ApiException("Subject type %s not found", requestSubjectType);
        formMapping.setSubjectType(subjectType);
    }

}