package org.openchs.web;

import org.openchs.application.*;
import org.openchs.builder.FormBuilder;
import org.openchs.dao.EncounterTypeRepository;
import org.openchs.dao.ProgramRepository;
import org.openchs.dao.application.FormMappingRepository;
import org.openchs.dao.application.FormRepository;
import org.openchs.domain.*;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.web.request.ConceptContract;
import org.openchs.web.request.FormatContract;
import org.openchs.web.request.application.BasicFormDetails;
import org.openchs.web.request.application.FormContract;
import org.openchs.web.request.application.FormElementContract;
import org.openchs.web.request.application.FormElementGroupContract;
import org.openchs.web.validation.ValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.webmvc.support.RepositoryEntityLinks;
import org.springframework.hateoas.Link;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.*;
import java.util.stream.Collectors;

import static org.springframework.hateoas.mvc.ControllerLinkBuilder.linkTo;
import static org.springframework.hateoas.mvc.ControllerLinkBuilder.methodOn;

@RestController
public class FormController {
    private final Logger logger;
    private FormRepository formRepository;
    private ProgramRepository programRepository;
    private EncounterTypeRepository encounterTypeRepository;
    private final FormMappingRepository formMappingRepository;
    private RepositoryEntityLinks entityLinks;

    @Autowired
    public FormController(FormRepository formRepository, ProgramRepository programRepository, EncounterTypeRepository encounterTypeRepository, FormMappingRepository formMappingRepository,
                          RepositoryEntityLinks entityLinks) {
        this.formRepository = formRepository;
        this.programRepository = programRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.formMappingRepository = formMappingRepository;
        this.entityLinks = entityLinks;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/forms", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    void save(@RequestBody FormContract formRequest) {
        logger.info(String.format("Saving form: %s, with UUID: %s", formRequest.getName(), formRequest.getUuid()));
        Form savedForm = saveForm(formRequest);
        for (String encounterType : associatedEncounterTypes(formRequest)) {
            formMappingRepository.save(createOrUpdateFormMapping(formRequest, encounterType, savedForm));
        }
    }

    private Form saveForm(@RequestBody FormContract formRequest) {
        Form existingForm = formRepository.findByUuid(formRequest.getUuid());
        FormBuilder formBuilder = new FormBuilder(existingForm);
        Form form = formBuilder.withName(formRequest.getName())
                .withType(formRequest.getFormType())
                .withUUID(formRequest.getUuid())
                .withFormElementGroups(formRequest.getFormElementGroups())
                .build();
        return formRepository.save(form);
    }

    @RequestMapping(value = "/forms", method = RequestMethod.PATCH)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    public void patch(@RequestBody FormContract formRequest) {
        logger.info(String.format("Patching form: %s, with UUID: %s", formRequest.getName(), formRequest.getUuid()));
        saveForm(formRequest);
    }

    @RequestMapping(value = "/forms", method = RequestMethod.DELETE)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    public void remove(@RequestBody FormContract formRequest) {
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        Form existingForm = formRepository.findByUuid(formRequest.getUuid());
        FormBuilder formBuilder = new FormBuilder(existingForm);
        Form form = formBuilder.withoutFormElements(organisation, formRequest.getFormElementGroups())
                .build();
        formRepository.save(form);
    }

    private List<String> associatedEncounterTypes(@RequestBody FormContract formRequest) {
        List<String> associatedEncounterTypeNames = new ArrayList<>();
        associatedEncounterTypeNames.addAll(formRequest.getEncounterTypes());
        if (associatedEncounterTypeNames.size() == 0) {
            associatedEncounterTypeNames.add(formRequest.getName());
        }
        return associatedEncounterTypeNames;
    }

    private FormMapping createOrUpdateFormMapping(@RequestBody FormContract formRequest, String encounterTypeName, Form form) {
        EncounterType encounterType = null;
        if (FormType.valueOf(formRequest.getFormType()).hasEncounterType()) {
            encounterType = encounterTypeRepository.findByName(encounterTypeName);
            if (encounterType == null) {
                encounterType = new EncounterType();
                encounterType.assignUUID();
            }
            encounterType.setName(encounterTypeName);
            encounterType = encounterTypeRepository.save(encounterType);
        }
        Long observationsTypeEntityId = encounterType == null ? null : encounterType.getId();

        FormMapping formMapping = formMappingRepository.findByFormUuidAndObservationsTypeEntityId(formRequest.getUuid(), observationsTypeEntityId);
        if (formMapping == null) {
            formMapping = new FormMapping();
            formMapping.assignUUID();
            formMapping.setForm(form);
        }

        formMapping.setObservationsTypeEntityId(observationsTypeEntityId);

        if (formRequest.getProgramName() != null) {
            Program program = programRepository.findByName(formRequest.getProgramName());
            formMapping.setEntityId(program.getId());
        }

        return formMapping;
    }


    @RequestMapping(value = "/forms/export", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin', 'user')")
    public FormContract export(@RequestParam String formUUID) {
        Form form = formRepository.findByUuid(formUUID);
        List<FormMapping> formMappings = formMappingRepository.findByFormUuid(form.getUuid());

        List<String> encounterTypeNames = new ArrayList<>();
        for (FormMapping formMapping : formMappings) {
            if (formMapping.getObservationsTypeEntityId() != null) {
                encounterTypeNames.add(encounterTypeRepository.findOne(formMapping.getObservationsTypeEntityId()).getName());
            }
        }

        String programName = null;
        if (formMappings.size() > 0 && formMappings.get(0).getEntityId() != null) {
            programName = programRepository.findOne(formMappings.get(0).getEntityId()).getName();
        }

        FormContract formContract = new FormContract(formUUID, form.getAudit().getLastModifiedBy().getUuid(), form.getName(), form.getFormType().toString(), programName, encounterTypeNames);

        form.getFormElementGroups().stream().sorted(Comparator.comparingDouble(FormElementGroup::getDisplayOrder)).forEach(formElementGroup -> {
            FormElementGroupContract formElementGroupContract = new FormElementGroupContract(formElementGroup.getUuid(), null, formElementGroup.getName(), formElementGroup.getDisplayOrder());
            formElementGroupContract.setDisplay(formElementGroup.getDisplay());
            formElementGroupContract.setVoided(formElementGroup.isVoided());
            formContract.addFormElementGroup(formElementGroupContract);
            formElementGroup.getFormElements().stream().sorted(Comparator.comparingDouble(FormElement::getDisplayOrder)).forEach(formElement -> {
                FormElementContract formElementContract = new FormElementContract();
                formElementContract.setUuid(formElement.getUuid());
                formElementContract.setName(formElement.getName());
                formElementContract.setMandatory(formElement.isMandatory());
                formElementContract.setVoided(formElement.isVoided());
                formElementContract.setKeyValues(formElement.getKeyValues());
                formElementContract.setConcept(getConceptContract(formElement.getConcept()));
                formElementContract.setDisplayOrder(formElement.getDisplayOrder());
                formElementContract.setType(formElement.getType());
                if (formElement.getValidFormat() != null) {
                    formElementContract.setValidFormat(new FormatContract(formElement.getValidFormat().getRegex(),
                            formElement.getValidFormat().getDescriptionKey()));
                }


                formElementGroupContract.addFormElement(formElementContract);
            });
        });

        return formContract;
    }

    private ConceptContract getConceptContract(Concept concept) {
        ConceptContract conceptContract = new ConceptContract();
        BeanUtils.copyProperties(concept, conceptContract);
        if (ConceptDataType.Coded.toString().equals(concept.getDataType())) {
            conceptContract.setAnswers(new ArrayList<>());
        }
        for (ConceptAnswer answer : concept.getConceptAnswers()) {
            ConceptContract answerConceptContract = new ConceptContract();
            answerConceptContract.setUuid(answer.getAnswerConcept().getUuid());
            answerConceptContract.setName(answer.getAnswerConcept().getName());
            conceptContract.getAnswers().add(answerConceptContract);
        }

        return conceptContract;
    }

    /**
     * Example of a request URL: /forms/program/1?page=3&size=1
     * Links added are:
     * <ol>
     * <li>self: /forms/program/1</li>
     * <li>form: /form/7</li>
     * <li>formElementGroups: /form/7/formElementGroups</li>
     * <li>createdBy: /user/1</li>
     * <li>lastModifiedBy: /user/1</li>
     * </ol>
     */
    @RequestMapping(value = "/forms/program/{programId}", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin', 'user')")
    public List<BasicFormDetails> getForms(@PathVariable("programId") Long programId, Pageable pageable) {
        Program program = programRepository.findOne(programId);
        if (program == null) {
            throw new ValidationException(String.format("No program found for ID %s", programId));
        }
        return getFormsByProgram(program, pageable);
    }

    private List<BasicFormDetails> getFormsByProgram(Program program, Pageable pageable) {
        Long programId = program.getId();
        Page<FormMapping> fmPage = formMappingRepository.findByEntityId(programId, pageable);
        return fmPage.getContent().stream().map(fm -> {
            Form form = fm.getForm();
            BasicFormDetails formDetail = new BasicFormDetails(form, program.getName());
            formDetail.add(linkTo(methodOn(FormController.class).getForms(programId, pageable)).withSelfRel());
            Link formLink = entityLinks.linkToSingleResource(Form.class, form.getId());
            formDetail.add(formLink);
            formDetail.add(new Link(formLink.getHref() + "/formElementGroups", "formElementGroups"));
            formDetail.add(entityLinks.linkToSingleResource(User.class, form.getAudit().getCreatedBy().getId()).withRel("createdBy"));
            formDetail.add(entityLinks.linkToSingleResource(User.class, form.getAudit().getLastModifiedBy().getId()).withRel("lastModifiedBy"));
            return formDetail;
        }).collect(Collectors.toList());
    }

    /**
     * Retrieves all forms grouped by program
     * Response looks like below
     * [{
     * program: {
     * <p>
     * }
     * forms: [
     * <p>
     * ]
     * },
     * {...},
     * {...}
     * ]
     *
     * @param pageable
     * @return list of program/forms
     */
    @RequestMapping(value = "/forms", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin', 'user')")
    public List<Map<String, Object>> getForms(Pageable pageable) {
        Iterable<Program> programItr = programRepository.findAll();
        List<Map<String, Object>> response = new ArrayList<>();
        programItr.forEach(program -> {
            Map<String, Object> formsByProgram = new HashMap<>();
            Map<String, Object> programDetails = new HashMap<>();
            programDetails.put("name", program.getName());
            programDetails.put("colour", program.getColour());
            programDetails.put("uuid", program.getUuid());
            programDetails.put("id", program.getId());

            formsByProgram.put("program", programDetails);
            formsByProgram.put("forms", getFormsByProgram(program, pageable));
            response.add(formsByProgram);
        });
        return response;
    }
}