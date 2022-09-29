package org.avni.server.web;

import org.avni.server.application.*;
import org.avni.server.builder.FormBuilder;
import org.avni.server.builder.FormBuilderException;
import org.avni.server.dao.OperationalProgramRepository;
import org.avni.server.dao.ProgramRepository;
import org.avni.server.dao.application.FormMappingRepository;
import org.avni.server.dao.application.FormRepository;
import org.avni.server.domain.*;
import org.avni.server.domain.task.TaskType;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.projection.FormWebProjection;
import org.avni.server.projection.IdentifierAssignmentProjection;
import org.avni.server.service.*;
import org.avni.server.web.request.application.FormElementContract;
import org.avni.server.web.validation.ValidationException;
import org.avni.server.util.BadRequestError;
import org.avni.server.util.ReactAdminUtil;
import org.avni.server.web.request.ConceptContract;
import org.avni.server.web.request.FormMappingContract;
import org.avni.server.web.request.FormatContract;
import org.avni.server.web.request.application.BasicFormDetails;
import org.avni.server.web.request.application.FormContract;
import org.avni.server.web.request.application.FormElementGroupContract;
import org.avni.server.web.request.webapp.CreateUpdateFormRequest;
import org.avni.server.web.request.webapp.FormMappingRequest;
import org.avni.server.web.request.webapp.task.TaskTypeContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.data.rest.webmvc.support.RepositoryEntityLinks;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.persistence.criteria.Predicate;
import javax.transaction.Transactional;
import java.io.InvalidObjectException;
import java.util.*;
import java.util.stream.Collectors;

import static org.springframework.hateoas.mvc.ControllerLinkBuilder.linkTo;
import static org.springframework.hateoas.mvc.ControllerLinkBuilder.methodOn;

@RestController
public class FormController implements RestControllerResourceProcessor<BasicFormDetails> {
    private final Logger logger;
    private final FormMappingRepository formMappingRepository;
    private final FormMappingService formMappingService;
    private final FormService formService;
    private FormRepository formRepository;
    private ProgramRepository programRepository;
    private OperationalProgramRepository operationalProgramRepository;
    private RepositoryEntityLinks entityLinks;
    private ProjectionFactory projectionFactory;
    private UserService userService;
    private IdentifierAssignmentService identifierAssignmentService;
    private final ConceptService conceptService;

    @Autowired
    public FormController(FormRepository formRepository,
                          ProgramRepository programRepository,
                          FormMappingRepository formMappingRepository,
                          OperationalProgramRepository operationalProgramRepository,
                          RepositoryEntityLinks entityLinks,
                          ProjectionFactory projectionFactory,
                          FormMappingService formMappingService,
                          FormService formService,
                          UserService userService,
                          IdentifierAssignmentService identifierAssignmentService, ConceptService conceptService) {
        this.formRepository = formRepository;
        this.programRepository = programRepository;
        this.formMappingRepository = formMappingRepository;
        this.operationalProgramRepository = operationalProgramRepository;
        this.entityLinks = entityLinks;
        this.projectionFactory = projectionFactory;
        this.formMappingService = formMappingService;
        this.formService = formService;
        this.userService = userService;
        this.identifierAssignmentService = identifierAssignmentService;
        this.conceptService = conceptService;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @GetMapping(value = "/web/forms")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'user')")
    public PagedResources<Resource<BasicFormDetails>> getAllFormsWeb(
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "includeVoided", required = false) boolean includeVoided,
            Pageable pageable) {
        Long organisationId = UserContextHolder.getUserContext().getOrganisation().getId();
        Sort sortWithId = pageable.getSort().and(new Sort("id"));

        PageRequest pageRequest = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(), sortWithId);

        Page<Form> forms = formRepository.findAll((root, query, builder) -> {
            Predicate predicate = builder.equal(root.get("organisationId"), organisationId);
            if (name != null)
                predicate = builder.and(predicate, builder.like(builder.upper(root.get("name")), "%" + name.toUpperCase() + "%"));
            if (!includeVoided)
                predicate = builder.and(predicate, builder.equal(root.get("isVoided"), false));
            return predicate;
        }, pageRequest);

        Page<BasicFormDetails> basicFormDetailsPage = forms.map(form -> {
            BasicFormDetails basicFormDetails = new BasicFormDetails(form, null);
            List<FormMapping> formMappings = formMappingRepository.findByFormIdAndIsVoidedFalse(form.getId());
            if (formMappings.size() > 0) {
                FormMapping firstFormMapping = formMappings.get(0);
                Program program = firstFormMapping.getProgram();
                if (program != null)
                    basicFormDetails.setProgramName(program.getOperationalProgramName());
                if (firstFormMapping.getSubjectType() != null)
                    basicFormDetails.setSubjectName(firstFormMapping.getSubjectType().getName());
                if (firstFormMapping.getTaskType() != null)
                    basicFormDetails.setTaskTypeName(firstFormMapping.getTaskType().getName());
            }
            return basicFormDetails;
        });
        return wrap(basicFormDetailsPage);
    }

    @RequestMapping(value = "/forms", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    public ResponseEntity<?> save(@RequestBody FormContract formRequest) {
        logger.info(String.format("Saving form: %s, with UUID: %s", formRequest.getName(), formRequest.getUuid()));
        try {
            formRequest.validate();
            formService.checkIfLocationConceptsHaveBeenUsed(formRequest);
            formService.saveForm(formRequest);
        } catch (InvalidObjectException | FormBuilderException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        return ResponseEntity.ok(null);
    }

    @PostMapping(value = "/web/forms")
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    public ResponseEntity createWeb(@RequestBody CreateUpdateFormRequest request) {
        validateCreate(request);
        FormBuilder formBuilder = new FormBuilder(null);
        Form form = formBuilder
                .withName(request.getName())
                .withType(request.getFormType())
                .withUUID(UUID.randomUUID().toString())
                .build();
        formRepository.save(form);

        return ResponseEntity.ok(form);
    }

    @DeleteMapping(value = "/web/forms/{formUUID}")
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    public ResponseEntity deleteWeb(@PathVariable String formUUID) {
        try {
            Form existingForm = formRepository.findByUuid(formUUID);
            List<FormMapping> formMappings = formMappingRepository.findByFormId(existingForm.getId());
            for (FormMapping formMapping : formMappings) {
                FormMappingContract formMappingContract = FormMappingContract.fromFormMapping(formMapping);
                formMappingContract.setVoided(true);
                formMappingService.createOrUpdateFormMapping(formMappingContract);
            }
            existingForm.setVoided(!existingForm.isVoided());
            existingForm.setName(ReactAdminUtil.getVoidedName(existingForm.getName(), existingForm.getId()));
            formRepository.save(existingForm);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        return ResponseEntity.ok(null);
    }

    private void validateCreate(CreateUpdateFormRequest request) {
        if (formRepository.findByNameIgnoreCase(request.getName()) != null) {
            throw new BadRequestError("Form with name %s already exists", request.getName());
        }
    }

    @PutMapping(value = "web/forms/{formUUID}/metadata")
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    public ResponseEntity updateMetadata(@RequestBody CreateUpdateFormRequest request, @PathVariable String formUUID) {
        Form form = validateUpdateMetadata(request, formUUID);
        List<FormMappingRequest> formMappingRequests = request.getFormMappings();
        form.setName(request.getName());
        form.setFormType(FormType.valueOf(request.getFormType()));

        formRepository.save(form);
        formMappingRequests.forEach(formMappingRequest -> {
            FormMappingContract formMappingContract = new FormMappingContract();
            formMappingContract.setEncounterTypeUUID(formMappingRequest.getEncounterTypeUuid());
            formMappingContract.setProgramUUID(formMappingRequest.getProgramUuid());
            formMappingContract.setSubjectTypeUUID(formMappingRequest.getSubjectTypeUuid());
            formMappingContract.setVoided(formMappingRequest.getVoided());
            formMappingContract.setFormUUID(formUUID);
            formMappingContract.setUuid(formMappingRequest.getUuid());
            formMappingContract.setTaskTypeUUID(formMappingRequest.getTaskTypeUuid());
            formMappingService.createOrUpdateFormMapping(formMappingContract);
        });
        return ResponseEntity.ok(null);
    }

    private Form validateUpdateMetadata(CreateUpdateFormRequest request, String requestUUID) {
        Form byUuid = formRepository.findByUuid(requestUUID);
        if (byUuid == null) {
            throw new BadRequestError("Form with uuid %s does not exist", requestUUID);
        }
        Form byName = formRepository.findByNameIgnoreCase(request.getName());
        if (byName != null && !byName.getUuid().equals(requestUUID)) {
            throw new BadRequestError("Can not update form name to %s because form by that name already exists", request.getName());
        }
        return byUuid;
    }

    @RequestMapping(value = "/forms", method = RequestMethod.PATCH)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public ResponseEntity<?> patch(@RequestBody FormContract formRequest) {
        logger.info(String.format("Patching form: %s, with UUID: %s", formRequest.getName(), formRequest.getUuid()));
        try {
            formService.saveForm(formRequest);
        } catch (FormBuilderException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        return ResponseEntity.ok(null);
    }

    @RequestMapping(value = "/forms", method = RequestMethod.DELETE)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public ResponseEntity<?> remove(@RequestBody FormContract formRequest) {
        logger.info(String.format("Deleting from form: %s, with UUID: %s", formRequest.getName(), formRequest.getUuid()));
        try {
            Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
            Form existingForm = formRepository.findByUuid(formRequest.getUuid());
            FormBuilder formBuilder = new FormBuilder(existingForm);
            Form form = formBuilder.withoutFormElements(organisation, formRequest.getFormElementGroups())
                    .build();
            formRepository.save(form);
        } catch (FormBuilderException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        return ResponseEntity.ok(null);
    }

    @RequestMapping(value = "/forms/export", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    public FormContract export(@RequestParam String formUUID) {
        Form form = formRepository.findByUuid(formUUID);

        FormContract formContract = new FormContract(formUUID, form.getName(), form.getFormType().toString());
        formContract.setCreatedBy(form.getCreatedBy().getUsername());
        formContract.setLastModifiedBy(form.getLastModifiedBy().getUsername());
        formContract.setCreatedDateTime(form.getCreatedDateTime());
        formContract.setModifiedDateTime(form.getLastModifiedDateTime());
        formContract.setDecisionRule(form.getDecisionRule());
        formContract.setVisitScheduleRule(form.getVisitScheduleRule());
        formContract.setTaskScheduleRule(form.getTaskScheduleRule());
        formContract.setValidationRule(form.getValidationRule());
        formContract.setChecklistsRule(form.getChecklistsRule());
        formContract.setOrganisationId(form.getOrganisationId());
        form.getDecisionConcepts().forEach(concept -> {
            ConceptContract conceptContract = new ConceptContract();
            BeanUtils.copyProperties(concept, conceptContract);
            formContract.addDecisionConcept(conceptContract);
        });
        formContract.setValidationDeclarativeRule(form.getValidationDeclarativeRule());
        formContract.setDecisionDeclarativeRule(form.getDecisionDeclarativeRule());
        formContract.setVisitScheduleDeclarativeRule(form.getVisitScheduleDeclarativeRule());

        //Assuming that we'll have single registration form per subject types
        List<FormMapping> formMappings = formMappingRepository.findByFormIdAndIsVoidedFalse(form.getId());
        if (formMappings.size() > 0) {
            FormMapping formMapping = formMappings.get(0);
            formContract.setSubjectType(formMapping.getSubjectType());
            TaskType taskType = formMapping.getTaskType();
            formContract.setTaskType(TaskTypeContract.fromEntity(taskType, conceptService));
        }

        form.getFormElementGroups().stream().sorted(Comparator.comparingDouble(FormElementGroup::getDisplayOrder)).forEach(formElementGroup -> {
            FormElementGroupContract formElementGroupContract = new FormElementGroupContract(formElementGroup.getUuid(), formElementGroup.getName(), formElementGroup.getDisplayOrder());
            formElementGroupContract.setDisplay(formElementGroup.getDisplay());
            formElementGroupContract.setVoided(formElementGroup.isVoided());
            formElementGroupContract.setOrganisationId(formElementGroup.getOrganisationId());
            formElementGroupContract.setRule(formElementGroup.getRule());
            formElementGroupContract.setDeclarativeRule(formElementGroup.getDeclarativeRule());
            formElementGroupContract.setTimed(formElementGroup.isTimed());
            formElementGroupContract.setStartTime(formElementGroup.getStartTime());
            formElementGroupContract.setStayTime(formElementGroup.getStayTime());
            formElementGroupContract.setTextColour(formElementGroup.getTextColour());
            formElementGroupContract.setBackgroundColour(formElementGroup.getBackgroundColour());
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
                formElementContract.setOrganisationId(formElement.getOrganisationId());
                formElementContract.setRule(formElement.getRule());
                formElementContract.setDeclarativeRule(formElement.getDeclarativeRule());
                if (formElement.getValidFormat() != null) {
                    formElementContract.setValidFormat(new FormatContract(formElement.getValidFormat().getRegex(),
                            formElement.getValidFormat().getDescriptionKey()));
                }
                if(formElement.getGroup() != null) {
                    formElementContract.setParentFormElementUuid(formElement.getGroup().getUuid());
                }
                if (formElement.getDocumentation() != null) {
                    Documentation documentation = formElement.getDocumentation();
                    JsonObject documentationOption = new JsonObject()
                            .with("label", documentation.getName())
                            .with("value", documentation.getUuid());
                    formElementContract.setDocumentation(documentationOption);
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
            answerConceptContract.setOrder(answer.getOrder());
            answerConceptContract.setVoided(answer.isVoided());
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
        Page<FormMapping> fmPage = formMappingRepository.findByProgramId(programId, pageable);
        return fmPage.getContent().stream().map(fm -> {
            Form form = fm.getForm();
            BasicFormDetails formDetail = new BasicFormDetails(form, program.getOperationalProgramName());
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

        Iterable<OperationalProgram> programItr = operationalProgramRepository.findAllByIsVoidedFalse();
        List<Map<String, Object>> response = new ArrayList<>();
        programItr.forEach(program -> {
            Map<String, Object> formsByProgram = new HashMap<>();
            Map<String, Object> programDetails = new HashMap<>();
            programDetails.put("name", program.getName());
            programDetails.put("colour", program.getColour());
            programDetails.put("uuid", program.getUuid());
            programDetails.put("id", program.getId());

            formsByProgram.put("program", programDetails);
            formsByProgram.put("forms", getFormsByProgram(program.getProgram(), pageable));
            response.add(formsByProgram);
        });
        return response;
    }

    @GetMapping(value = "/web/form/{uuid}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public FormWebProjection getFormForWeb(@PathVariable String uuid) {
        return projectionFactory.createProjection(FormWebProjection.class, formRepository.findByUuid(uuid));
    }

    @GetMapping(value = "/web/form/{uuid}/identifierAssignments")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'user')")
    @ResponseBody
    public List<IdentifierAssignmentProjection> getFormIdentifiers(@PathVariable String uuid) {
        try {
            User currentUser = userService.getCurrentUser();
            Form form = formRepository.findByUuid(uuid);
            return identifierAssignmentService
                    .generateIdentifiersForAForm(form, currentUser)
                    .stream()
                    .filter(identifierAssignment -> identifierAssignment != null)
                    .map(identifierAssignment -> projectionFactory.createProjection(IdentifierAssignmentProjection.class, identifierAssignment))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error(e.getMessage());
            throw e;
        }
    }
}
