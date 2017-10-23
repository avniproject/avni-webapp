package org.openchs.web;

import org.openchs.application.*;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.EncounterTypeRepository;
import org.openchs.dao.ProgramRepository;
import org.openchs.dao.application.FormElementGroupRepository;
import org.openchs.dao.application.FormMappingRepository;
import org.openchs.dao.application.FormRepository;
import org.openchs.domain.*;
import org.openchs.domain.Concept;
import org.openchs.web.request.CHSRequest;
import org.openchs.web.request.application.BasicFormDetails;
import org.openchs.web.request.application.FormContract;
import org.openchs.web.request.application.FormElementContract;
import org.openchs.web.request.application.FormElementGroupContract;
import org.openchs.web.validation.ValidationException;
import org.openchs.web.validation.ValidationResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.webmvc.support.RepositoryEntityLinks;
import org.springframework.hateoas.Link;
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
    private FormMappingRepository formMappingRepository;
    private ConceptRepository conceptRepository;
    private FormElementGroupRepository formElementGroupRepository;
    private RepositoryEntityLinks entityLinks;


    @Autowired
    public FormController(FormRepository formRepository, ProgramRepository programRepository, EncounterTypeRepository encounterTypeRepository, FormMappingRepository formMappingRepository, ConceptRepository conceptRepository, FormElementGroupRepository formElementGroupRepository,
                          RepositoryEntityLinks entityLinks) {
        this.formRepository = formRepository;
        this.programRepository = programRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.formMappingRepository = formMappingRepository;
        this.conceptRepository = conceptRepository;
        this.formElementGroupRepository = formElementGroupRepository;
        this.entityLinks = entityLinks;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    //update scenario
    @RequestMapping(value = "/forms", method = RequestMethod.POST)
    @Transactional
    void save(@RequestBody FormContract formRequest) {
        logger.info(String.format("Saving form: %s, with UUID: %s", formRequest.getName(), formRequest.getUuid()));
        String associatedEncounterTypeName;

        Form form = formRepository.findByUuid(formRequest.getUuid());
        if (form == null) {
            form = Form.create();
            form.setUuid(formRequest.getUuid());
            associatedEncounterTypeName = formRequest.getName();
        } else {
            associatedEncounterTypeName = form.getName();
        }
        form.setName(formRequest.getName());
        form.setFormType(FormType.valueOf(formRequest.getFormType()));

        //hack because commit is getting called before end of the method
        int randomOffsetToAvoidClash = 100;
        List<FormElementGroupContract> formElementGroupsFromCurrentRequest = formRequest.getFormElementGroups();
        for (int formElementGroupIndex = 0; formElementGroupIndex < formElementGroupsFromCurrentRequest.size(); formElementGroupIndex++) {
            FormElementGroupContract formElementGroupRequest = formElementGroupsFromCurrentRequest.get(formElementGroupIndex);
            FormElementGroup formElementGroup = form.findFormElementGroup(formElementGroupRequest.getUuid());
            if (formElementGroup != null) {
                formElementGroup.setDisplayOrder((short) (getDisplayOrder(formElementGroupIndex, formElementGroupRequest) + randomOffsetToAvoidClash));
                formElementGroupRepository.save(formElementGroup);
            }
        }
        //end hack

        updateFormElementGroups(form, formElementGroupsFromCurrentRequest);

        FormMapping formMapping = createOrUpdateFormMapping(formRequest, associatedEncounterTypeName, form);

        formRepository.save(form);
        formMappingRepository.save(formMapping);
    }

    private FormMapping createOrUpdateFormMapping(@RequestBody FormContract formRequest, String associatedEncounterTypeName, Form form) {
        FormMapping formMapping = formMappingRepository.findByFormUuid(form.getUuid());
        if (formMapping == null) {
            formMapping = new FormMapping();
            formMapping.assignUUID();
            formMapping.setForm(form);
        }

        if (formRequest.getProgramName() != null) {
            Program program = programRepository.findByName(formRequest.getProgramName());
            formMapping.setEntityId(program.getId());
        }

        if (FormType.valueOf(formRequest.getFormType()).hasEncounterType()) {
            EncounterType encounterType = encounterTypeRepository.findByName(associatedEncounterTypeName);
            if (encounterType == null) {
                encounterType = new EncounterType();
                encounterType.assignUUID();
            }
            encounterType.setName(formRequest.getName());
            encounterType = encounterTypeRepository.save(encounterType);
            formMapping.setObservationsTypeEntityId(encounterType.getId());
        }
        return formMapping;
    }

    private void updateFormElementGroups(Form form, List<FormElementGroupContract> formElementGroupsFromCurrentRequest) {
        for (int formElementGroupIndex = 0; formElementGroupIndex < formElementGroupsFromCurrentRequest.size(); formElementGroupIndex++) {
            FormElementGroupContract formElementGroupRequest = formElementGroupsFromCurrentRequest.get(formElementGroupIndex);
            FormElementGroup formElementGroup = createOrUpdateFormElementGroup(form, formElementGroupIndex, formElementGroupRequest);

            updateFormElements(formElementGroup, formElementGroupRequest.getFormElements());
        }

        List<String> formElementGroupUUIDs = formElementGroupsFromCurrentRequest.stream().map(CHSRequest::getUuid).collect(Collectors.toList());
        form.removeFormElementGroups(formElementGroupUUIDs);
    }

    private FormElementGroup createOrUpdateFormElementGroup(Form form, int formElementGroupIndex, FormElementGroupContract formElementGroupRequest) {
        FormElementGroup formElementGroup = form.findFormElementGroup(formElementGroupRequest.getUuid());
        if (formElementGroup == null) {
            formElementGroup = form.addFormElementGroup(formElementGroupRequest.getUuid());
        }
        formElementGroup.setName(formElementGroupRequest.getName());
        formElementGroup.setDisplay(formElementGroupRequest.getDisplay());
        formElementGroup.setDisplayOrder(getDisplayOrder(formElementGroupIndex, formElementGroupRequest));
        return formElementGroup;
    }

    private void updateFormElements(FormElementGroup formElementGroup, List<FormElementContract> formElementsFromCurrentRequest) {
        for (int formElementIndex = 0; formElementIndex < formElementsFromCurrentRequest.size(); formElementIndex++) {
            FormElementContract formElementRequest = formElementsFromCurrentRequest.get(formElementIndex);
            ValidationResult validationResult = formElementRequest.validate();
            if (validationResult.isFailure()) {
                throw new ValidationException(validationResult.getMessage());
            }
            createOrUpdateFormElement(formElementGroup, formElementIndex, formElementRequest);

            removeUnwantedFormElements(formElementGroup, formElementsFromCurrentRequest);
        }
    }

    private void removeUnwantedFormElements(FormElementGroup formElementGroup, List<FormElementContract> formElementsFromCurrentRequest) {
        List<String> formElementUUIDs = formElementsFromCurrentRequest.stream().map(CHSRequest::getUuid).collect(Collectors.toList());
        formElementGroup.removeFormElements(formElementUUIDs);
    }

    private void createOrUpdateFormElement(FormElementGroup formElementGroup, int formElementIndex, FormElementContract formElementRequest) {
        Concept concept = createOrUpdateConcept(formElementRequest);

        FormElement formElement = formElementGroup.findFormElement(formElementRequest.getUuid());
        if (formElement == null) {
            formElement = formElementGroup.addFormElement(formElementRequest.getUuid());
        }
        formElement.setName(formElementRequest.getName());
        formElement.setDisplayOrder(formElementRequest.getDisplayOrder() == 0 ? (short) (formElementIndex + 1) : formElementRequest.getDisplayOrder());
        formElement.setFormElementGroup(formElementGroup);
        formElement.setMandatory(formElementRequest.isMandatory());
        formElement.setKeyValues(formElementRequest.getKeyValues());
        formElement.setConcept(concept);
    }

    private Concept createOrUpdateConcept(FormElementContract formElementRequest) {
        String conceptName = formElementRequest.getConceptName() == null ? formElementRequest.getName() : formElementRequest.getConceptName();
        Concept concept = conceptRepository.findByName(conceptName);
        if (concept == null) {
            concept = Concept.create(conceptName, formElementRequest.getDataType());
        }
        if (ConceptDataType.Coded.toString().equals(formElementRequest.getDataType())) {
            addAnswers(formElementRequest, concept);
        }
        conceptRepository.save(concept);
        return concept;
    }

    private void addAnswers(FormElementContract formElementRequest, Concept concept) {
        for (int answerIndex = 0; answerIndex < formElementRequest.getAnswers().size(); answerIndex++) {
            String answerConceptName = formElementRequest.getAnswers().get(answerIndex);
            concept.addAnswer(fetchOrCreateConceptAnswer(concept, answerConceptName, (short) (answerIndex + 1)));
        }
    }

    private ConceptAnswer fetchOrCreateConceptAnswer(Concept concept, String answerConceptName, short answerOrder) {
        ConceptAnswer conceptAnswer = concept.findConceptAnswer(answerConceptName);
        if (conceptAnswer == null) {
            conceptAnswer = new ConceptAnswer();
            conceptAnswer.setOrder(answerOrder);
            conceptAnswer.assignUUID();

            conceptAnswer.setAnswerConcept(fetchOrCreateAnswer(answerConceptName));
        }
        return conceptAnswer;
    }

    private Concept fetchOrCreateAnswer(String answerConceptName) {
        Concept answer = conceptRepository.findByName(answerConceptName);
        if (answer == null) {
            answer = new Concept();
            answer.setName(answerConceptName);
            answer.assignUUID();
            answer.setDataType(ConceptDataType.NA.toString());
            conceptRepository.save(answer);
        }
        return answer;
    }

    private short getDisplayOrder(int formElementGroupIndex, FormElementGroupContract formElementGroupRequest) {
        return formElementGroupRequest.getDisplayOrder() == 0 ? (short) (formElementGroupIndex + 1) : formElementGroupRequest.getDisplayOrder();
    }

    @RequestMapping(value = "/forms/export", method = RequestMethod.GET)
    public FormContract export(@RequestParam String formUUID) {
        Form form = formRepository.findByUuid(formUUID);
        FormMapping formMapping = formMappingRepository.findByFormUuid(form.getUuid());
        Long entityId = formMapping.getEntityId();
        FormContract formContract;
        if (entityId != null && entityId != 0) {
            formContract = new FormContract(formUUID, form.getLastModifiedBy().getUuid(), form.getName(), form.getFormType().toString(), programRepository.findOne(entityId).getName());
        } else {
            formContract = new FormContract(formUUID, form.getLastModifiedBy().getUuid(), form.getName(), form.getFormType().toString(), null);
        }

        form.getFormElementGroups().stream().sorted(Comparator.comparingInt(FormElementGroup::getDisplayOrder)).forEach(formElementGroup -> {
            FormElementGroupContract formElementGroupContract = new FormElementGroupContract(formElementGroup.getUuid(), null, formElementGroup.getName(), formElementGroup.getDisplayOrder());
            formContract.addFormElementGroup(formElementGroupContract);
            formElementGroup.getFormElements().stream().sorted(Comparator.comparingInt(FormElement::getDisplayOrder)).forEach(formElement -> {
                String conceptName = formElement.isFormElementNameSameAsConceptName() ? null : formElement.getConcept().getName();
                FormElementContract formElementContract = new FormElementContract();
                formElementContract.setUuid(formElement.getUuid());
                formElementContract.setName(formElement.getName());
                formElementContract.setMandatory(formElement.isMandatory());
                formElementContract.setKeyValues(formElement.getKeyValues());
                formElementContract.setConceptName(conceptName);
                formElementContract.setDataType(formElement.getConcept().getDataType());
                formElementContract.setDisplayOrder(formElement.getDisplayOrder());

                if (ConceptDataType.Coded.toString().equals(formElement.getConcept().getDataType())) {
                    List<String> answers = formElement.getConcept().getConceptAnswers().stream().sorted(Comparator.comparingInt(ConceptAnswer::getOrder)).map(conceptAnswer -> conceptAnswer.getAnswerConcept().getName()).collect(Collectors.toList());
                    formElementContract.setAnswers(answers);
                }
                formElementGroupContract.addFormElement(formElementContract);
            });
        });

        return formContract;
    }

    /**
     * Example of a request URL: http://localhost:8021/forms/program/1?page=3&size=1
     * Links added are:
     * <ol>
     *     <li>self: http://localhost:8021/forms/program/1</li>
     *     <li>form: http://localhost:8021/form/7</li>
     *     <li>formElementGroups: http://localhost:8021/form/7/formElementGroups</li>
     *     <li>createdBy: http://localhost:8021/user/1</li>
     *     <li>lastModifiedBy: http://localhost:8021/user/1</li>
     * </ol>
     */
    @CrossOrigin
    @RequestMapping(value = "/forms/program/{programId}", method = RequestMethod.GET)
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
            formDetail.add(entityLinks.linkToSingleResource(User.class, form.getCreatedBy().getId()).withRel("createdBy"));
            formDetail.add(entityLinks.linkToSingleResource(User.class, form.getLastModifiedBy().getId()).withRel("lastModifiedBy"));
            return formDetail;
        }).collect(Collectors.toList());
    }

    /**
     * Retrieves all forms grouped by program
     * Response looks like below
     * [{
     *     program: {
     *
     *     }
     *     forms: [
     *
     *     ]
     * },
     * {...},
     * {...}
     * ]
     * @param pageable
     * @return list of program/forms
     */
    @CrossOrigin
    @RequestMapping(value = "/forms", method = RequestMethod.GET)
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