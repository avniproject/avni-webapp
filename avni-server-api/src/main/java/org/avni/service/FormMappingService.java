package org.avni.service;

import org.avni.application.Form;
import org.avni.application.FormElement;
import org.avni.application.FormMapping;
import org.avni.application.FormType;
import org.avni.dao.EncounterTypeRepository;
import org.avni.dao.ProgramRepository;
import org.avni.dao.SubjectTypeRepository;
import org.avni.dao.application.FormMappingRepository;
import org.avni.dao.application.FormRepository;
import org.avni.dao.task.TaskTypeRepository;
import org.avni.domain.EncounterType;
import org.avni.domain.Program;
import org.avni.domain.SubjectType;
import org.avni.util.BadRequestError;
import org.avni.web.request.FormMappingContract;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FormMappingService implements NonScopeAwareService {

    private final ProgramRepository programRepository;
    private final SubjectTypeRepository subjectTypeRepository;
    private final FormMappingRepository formMappingRepository;
    private final EncounterTypeRepository encounterTypeRepository;
    private final FormRepository formRepository;
    private final OrganisationConfigService organisationConfigService;
    private final TaskTypeRepository taskTypeRepository;

    @Autowired
    public FormMappingService(FormMappingRepository formMappingRepository,
                              EncounterTypeRepository encounterTypeRepository,
                              ProgramRepository programRepository,
                              SubjectTypeRepository subjectTypeRepository,
                              FormRepository formRepository,
                              OrganisationConfigService organisationConfigService,
                              TaskTypeRepository taskTypeRepository) {
        this.formMappingRepository = formMappingRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.programRepository = programRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.formRepository = formRepository;
        this.organisationConfigService = organisationConfigService;
        this.taskTypeRepository = taskTypeRepository;
    }

    public void saveFormMapping(FormMappingParameterObject parametersForNewMapping,
                                FormMappingParameterObject mappingsToVoid,
                                Form form) {
        voidExistingFormMappings(mappingsToVoid, form);

        saveMatchingFormMappings(parametersForNewMapping, form);
    }

    public void voidExistingFormMappings(FormMappingParameterObject mappingsToVoid, Form form) {
        FormType formType = form != null ? form.getFormType() : null;
        List<FormMapping> formMappingsToVoid = formMappingRepository.findRequiredFormMappings(
                mappingsToVoid.subjectTypeUuid,
                mappingsToVoid.programUuid,
                mappingsToVoid.encounterTypeUuid,
                formType
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
            formMapping.setEnableApproval(organisationConfigService.isApprovalWorkflowEnabled());
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

        if (StringUtils.hasText(formMappingRequest.getProgramUUID())) {
            formMapping.setProgram(programRepository.findByUuid(formMappingRequest.getProgramUUID()));
        }

        if (StringUtils.hasText(formMappingRequest.getEncounterTypeUUID())) {
            formMapping.setEncounterType(encounterTypeRepository.findByUuid(formMappingRequest.getEncounterTypeUUID()));
        }

        if (StringUtils.hasText(formMappingRequest.getSubjectTypeUUID())) {
            formMapping.setSubjectType(
                    subjectTypeRepository.findByUuid(
                            formMappingRequest.getSubjectTypeUUID()));
        } else {
            formMapping.setSubjectType(subjectTypeRepository.individualSubjectType());
        }

        if (StringUtils.hasText(formMappingRequest.getTaskTypeUUID())) {
            formMapping.setTaskType(taskTypeRepository.findByUuid(formMappingRequest.getTaskTypeUUID()));
        }

        formMapping.setVoided(formMappingRequest.isVoided());
        setEnableApproval(formMappingRequest, formMapping);
        formMappingRepository.save(formMapping);
    }

    public void createOrUpdateEmptyFormMapping(FormMappingContract formMappingRequest) {
        FormMapping formMapping = formMappingRepository.findByUuid(formMappingRequest.getUuid());
        if (formMapping == null) {
            formMapping = new FormMapping();
            formMapping.setUuid(formMappingRequest.getUuid());
        }

        Form form = null;
        if (formMappingRequest.getFormUUID() != null) {
            form = formRepository.findByUuid(formMappingRequest.getFormUUID());
        }
        formMapping.setForm(form);

        if (formMappingRequest.getProgramUUID() != null) {
            formMapping.setProgram(programRepository.findByUuid(formMappingRequest.getProgramUUID()));
        } else {
            formMapping.setProgram(null);
        }

        if (formMappingRequest.getEncounterTypeUUID() != null) {
            formMapping.setEncounterType(encounterTypeRepository.findByUuid(formMappingRequest.getEncounterTypeUUID()));
        } else {
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
        setEnableApproval(formMappingRequest, formMapping);
        formMappingRepository.save(formMapping);
    }

    private void setEnableApproval(FormMappingContract formMappingRequest, FormMapping formMapping) {
        boolean enableApproval = formMappingRequest.getEnableApproval() != null ?
                formMappingRequest.getEnableApproval() : organisationConfigService.isApprovalWorkflowEnabled();
        formMapping.setEnableApproval(enableApproval);
    }

    private void setEncounterTypeIfRequired(FormMapping formMapping, FormType formType, String encounterTypeUuid) {
        if (formType.isLinkedToEncounterType() && encounterTypeUuid != null) {
            EncounterType encounterType = encounterTypeRepository.findByUuid(encounterTypeUuid);
            if (encounterType == null) throw new BadRequestError("Encounter Type %s not found", encounterTypeUuid);
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
        if (subjectType == null) throw new BadRequestError("Subject type %s not found", requestSubjectType);
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

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return formMappingRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }

    public FormMapping find(EncounterType encounterType, FormType formType) {
        return formMappingRepository.findByFormFormTypeAndIsVoidedFalse(formType)
                .stream()
                .filter(fm -> encounterType.equals(fm.getEncounterType()))
                .findFirst()
                .orElse(null);
    }

    public FormMapping find(Program program, FormType formType) {
        return formMappingRepository.findByFormFormTypeAndIsVoidedFalse(formType)
                .stream()
                .filter(fm ->  program.equals(fm.getProgram()))
                .findFirst()
                .orElse(null);
    }
}
