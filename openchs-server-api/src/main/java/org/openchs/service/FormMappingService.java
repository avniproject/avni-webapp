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
import org.openchs.web.request.webapp.FormMappingRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
        for (FormMappingRequest formMappingRequest : createUpdateFormRequest.getFormMappings()){
            FormMapping formMapping = null;
            for(FormMapping fromMap : formMappings){
                if(fromMap.getUuid().equals(formMappingRequest.getUuid())){
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

    public void createFormMapping(CreateUpdateFormRequest createUpdateFormRequest, Form form) {
        FormType formType = form.getFormType();

        if (formType == FormType.ChecklistItem)
            return;
        validateRequest(createUpdateFormRequest, formType);
        FormMapping formMapping = new FormMapping();
        formMapping.assignUUID();
        formMapping.setForm(form);

        setSubjectTypeIfRequired(formMapping, createUpdateFormRequest.getFormMappingByIndex(0).getSubjectTypeUuid());
        setProgramNameIfRequired(formMapping, form.getFormType(), createUpdateFormRequest.getFormMappingByIndex(0).getProgramUuid());
        setEncounterTypeIfRequired(formMapping, form.getFormType(), createUpdateFormRequest.getFormMappingByIndex(0).getEncounterTypeUuid());
        formMappingRepository.save(formMapping);
    }

    private void validateRequest(CreateUpdateFormRequest createUpdateFormRequest, FormType formType) {
        if (formType.isLinkedToEncounterType() && createUpdateFormRequest.getFormMappingByIndex(0).getEncounterTypeUuid() == null) {
            throw new ApiException("Form of type %s must pass encounterType", formType);
        }

        if (createUpdateFormRequest.getFormMappingByIndex(0).getSubjectTypeUuid() == null) {
            throw new ApiException("Subject type must be specified");
        }

        if (formType.isLinkedToProgram() && createUpdateFormRequest.getFormMappingByIndex(0).getProgramUuid() == null) {
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

}