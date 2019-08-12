package org.openchs.service;

import org.openchs.application.Form;
import org.openchs.application.FormMapping;
import org.openchs.application.FormType;
import org.openchs.dao.*;
import org.openchs.dao.application.FormMappingRepository;
import org.openchs.dao.application.FormRepository;
import org.openchs.domain.EncounterType;
import org.openchs.domain.Program;
import org.openchs.domain.SubjectType;
import org.openchs.util.ApiException;
import org.openchs.web.request.webapp.CreateFormRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.List;

class CreateFormMapping {
    private String subjectType;
    private String programName;
    private String encounterType;
    private Form form;

    public String getSubjectType() {
        return subjectType;
    }

    public void setSubjectType(String subjectType) {
        this.subjectType = subjectType;
    }

    public String getProgramName() {
        return programName;
    }

    public void setProgramName(String programName) {
        this.programName = programName;
    }

    public String getEncounterType() {
        return encounterType;
    }

    public void setEncounterType(String encounterType) {
        this.encounterType = encounterType;
    }

    public Form getForm() {
        return form;
    }

    public void setForm(Form form) {
        this.form = form;
    }
}

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

    public void createFormMapping(CreateFormRequest createFormRequest, Form form) {
        FormType formType = form.getFormType();
        if (formType == FormType.ChecklistItem)
            return;

        if (formType.isLinkedToEncounterType() &&
                (CollectionUtils.isEmpty(createFormRequest.getEncounterTypes()))) {
            throw new ApiException("Form of type %s must pass encounterTypes", formType);
        }

        List<String> encounterTypes = createFormRequest.getEncounterTypes();
        if (encounterTypes != null) {
            for (String encounterType : encounterTypes) {
                CreateFormMapping formMapping = new CreateFormMapping();
                formMapping.setForm(form);
                formMapping.setProgramName(createFormRequest.getProgramName());
                formMapping.setSubjectType(createFormRequest.getSubjectType());
                formMapping.setEncounterType(encounterType);
                createFormMapping(formMapping);
            }
        } else {
            CreateFormMapping formMapping = new CreateFormMapping();
            formMapping.setForm(form);
            formMapping.setProgramName(createFormRequest.getProgramName());
            formMapping.setSubjectType(createFormRequest.getSubjectType());
            createFormMapping(formMapping);
        }
    }

    private void createFormMapping(CreateFormMapping createFormMapping) {
        FormMapping formMapping = new FormMapping();
        formMapping.assignUUID();
        Form form = createFormMapping.getForm();
        formMapping.setForm(form);

        FormType formType = form.getFormType();

        if (createFormMapping.getSubjectType() == null) {
            throw new ApiException("Subject type must be specified");
        } else {
            SubjectType subjectType = subjectTypeRepository.findByNameIgnoreCase(createFormMapping.getSubjectType());
            if (subjectType != null) {
                formMapping.setSubjectType(subjectType);
            } else {
                throw new ApiException("Subject type %s not found", createFormMapping.getSubjectType());
            }
        }

        if (formType.isLinkedToProgram()) {
            if (createFormMapping.getProgramName() == null) {
                throw new ApiException("Form of type %s must pass programName", formType);
            } else {
                Program program = programRepository.findByNameIgnoreCase(createFormMapping.getProgramName());
                if (program != null) {
                    formMapping.setProgram(program);
                } else {
                    throw new ApiException("Program %s not found", createFormMapping.getProgramName());
                }
            }
        }

        if (formType.isLinkedToEncounterType()) {
            if (createFormMapping.getEncounterType() == null) {
                throw new ApiException("Form of type %s must pass encounterType", formType);
            } else {
                EncounterType encounterType = encounterTypeRepository.findByNameIgnoreCase(createFormMapping.getEncounterType());
                if (encounterType != null) {
                    formMapping.setEncounterType(encounterType);
                } else {
                    throw new ApiException("Encounter Type %s not found", createFormMapping.getEncounterType());
                }
            }
        }

        formMappingRepository.save(formMapping);
    }

}