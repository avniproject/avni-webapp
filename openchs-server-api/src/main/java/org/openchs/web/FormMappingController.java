package org.openchs.web;

import org.openchs.application.Form;
import org.openchs.application.FormMapping;
import org.openchs.dao.EncounterTypeRepository;
import org.openchs.dao.ProgramRepository;
import org.openchs.dao.SubjectTypeRepository;
import org.openchs.dao.application.FormMappingRepository;
import org.openchs.dao.application.FormRepository;
import org.openchs.domain.SubjectType;
import org.openchs.web.request.FormMappingContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@RestController
public class FormMappingController extends AbstractController<FormMapping>{
    private final Logger logger;
    private final ProgramRepository programRepository;
    private SubjectTypeRepository subjectTypeRepository;
    private FormMappingRepository formMappingRepository;
    private EncounterTypeRepository encounterTypeRepository;
    private FormRepository formRepository;

    @Autowired
    public FormMappingController(FormMappingRepository formMappingRepository,
                                 EncounterTypeRepository encounterTypeRepository,
                                 FormRepository formRepository,
                                 ProgramRepository programRepository,
                                 SubjectTypeRepository subjectTypeRepository
    ) {
        this.formMappingRepository = formMappingRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.formRepository = formRepository;
        this.programRepository = programRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/formMappings", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    void save(@RequestBody List<FormMappingContract> formMappingRequests) {
        for (FormMappingContract formMappingRequest : formMappingRequests) {
            createOrUpdateFormMapping(formMappingRequest);
        }

    }

    private void createOrUpdateFormMapping(FormMappingContract formMappingRequest) {

        if(formMappingRequest.getFormUUID() == null){
            throw new RuntimeException("FormMappingRequest without form uuid! "+formMappingRequest);
        }
        Form form = formRepository.findByUuid(formMappingRequest.getFormUUID());
        if(form == null){
            throw new RuntimeException("Form not found!"+formMappingRequest);
        }
        FormMapping formMapping = newOrExistingEntity(formMappingRepository, formMappingRequest, new FormMapping());
        formMapping.setForm(form);

        if (formMappingRequest.getProgramUUID()!= null){
            formMapping.setEntityId(programRepository.findByUuid(formMappingRequest.getProgramUUID()).getId());
        }

        if (formMappingRequest.getEncounterTypeUUID()!= null){
            formMapping.setObservationsTypeEntityId(encounterTypeRepository.findByUuid(formMappingRequest.getEncounterTypeUUID()).getId());
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
}