package org.openchs.web;

import org.openchs.application.*;
import org.openchs.builder.FormBuilder;
import org.openchs.builder.FormBuilderException;
import org.openchs.dao.OperationalEncounterTypeRepository;
import org.openchs.dao.OperationalProgramRepository;
import org.openchs.dao.ProgramRepository;
import org.openchs.dao.application.FormMappingRepository;
import org.openchs.dao.application.FormRepository;
import org.openchs.domain.*;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.projection.FormWebProjection;
import org.openchs.service.FormMappingService;
import org.openchs.service.FormService;
import org.openchs.util.ApiException;
import org.openchs.util.ReactAdminUtil;
import org.openchs.web.request.ConceptContract;
import org.openchs.web.request.FormMappingContract;
import org.openchs.web.request.FormatContract;
import org.openchs.web.request.application.BasicFormDetails;
import org.openchs.web.request.application.FormContract;
import org.openchs.web.request.application.FormElementContract;
import org.openchs.web.request.application.FormElementGroupContract;
import org.openchs.web.request.webapp.CreateUpdateFormRequest;
import org.openchs.web.request.webapp.FormMappingRequest;
import org.openchs.web.validation.ValidationException;
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
    private OperationalEncounterTypeRepository operationalEncounterTypeRepository;
    private RepositoryEntityLinks entityLinks;
    private ProjectionFactory projectionFactory;

    @Autowired
    public FormController(FormRepository formRepository,
                          ProgramRepository programRepository,
                          FormMappingRepository formMappingRepository,
                          OperationalProgramRepository operationalProgramRepository,
                          OperationalEncounterTypeRepository operationalEncounterTypeRepository,
                          RepositoryEntityLinks entityLinks,
                          ProjectionFactory projectionFactory,
                          FormMappingService formMappingService, FormService formService) {
        this.formRepository = formRepository;
        this.programRepository = programRepository;
        this.formMappingRepository = formMappingRepository;
        this.operationalProgramRepository = operationalProgramRepository;
        this.operationalEncounterTypeRepository = operationalEncounterTypeRepository;
        this.entityLinks = entityLinks;
        this.projectionFactory = projectionFactory;
        this.formMappingService = formMappingService;
        this.formService = formService;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @GetMapping(value = "/web/forms")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    public PagedResources<Resource<BasicFormDetails>> getAllFormsWeb(
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "includeVoided", required = false) boolean includeVoided,
            Pageable pageable) {
        Long organisationId = UserContextHolder.getUserContext().getOrganisation().getId();
        Sort sortWithId = pageable.getSort().and(new Sort("id"));

        PageRequest pageRequest = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(), sortWithId);

        Page<Form> forms = formRepository.findAll((root, query, builder) -> {
            Predicate predicate = builder.equal(root.get("organisationId"), organisationId);
            if(name != null)
                predicate = builder.and(predicate, builder.like(builder.upper(root.get("name")), "%" + name.toUpperCase() + "%"));
            if(!includeVoided)
                predicate = builder.and(predicate, builder.equal(root.get("isVoided"), false));
            return predicate;
        }, pageRequest);

        Page<BasicFormDetails> basicFormDetailsPage = forms.map(form -> {
            BasicFormDetails basicFormDetails = new BasicFormDetails(form, null);
            List<FormMapping> formMappings = formMappingRepository.findByFormId(form.getId());
            if (formMappings.size() > 0) {
                FormMapping firstFormMapping = formMappings.get(0);
                Program program = firstFormMapping.getProgram();
                if (program != null)
                    basicFormDetails.setProgramName(program.getOperationalProgramName());
                basicFormDetails.setSubjectName(firstFormMapping.getSubjectType().getName());
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
            throw new ApiException("Form with name %s already exists", request.getName());
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
        formMappingRequests.forEach(formMappingRequest ->{
            FormMappingContract formMappingContract = new FormMappingContract();
            formMappingContract.setEncounterTypeUUID(formMappingRequest.getEncounterTypeUuid());
            formMappingContract.setProgramUUID(formMappingRequest.getProgramUuid());
            formMappingContract.setSubjectTypeUUID(formMappingRequest.getSubjectTypeUuid());
            formMappingContract.setVoided(formMappingRequest.getVoided());
            formMappingContract.setFormUUID(formUUID);
            formMappingContract.setUuid(formMappingRequest.getUuid());
            formMappingService.createOrUpdateFormMapping(formMappingContract);
        });
        return ResponseEntity.ok(null);
    }

    private Form validateUpdateMetadata(CreateUpdateFormRequest request, String requestUUID) {
        Form byUuid = formRepository.findByUuid(requestUUID);
        if (byUuid == null) {
            throw new ApiException("Form with uuid %s does not exist", requestUUID);
        }
        Form byName = formRepository.findByNameIgnoreCase(request.getName());
        if (byName != null && !byName.getUuid().equals(requestUUID)) {
            throw new ApiException("Can not update form name to %s because form by that name already exists", request.getName());
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

        FormContract formContract = new FormContract(formUUID, form.getAudit().getLastModifiedBy().getUuid(), form.getName(), form.getFormType().toString());
        formContract.setCreatedBy(form.getAudit().getCreatedBy().getUsername());
        formContract.setLastModifiedBy(form.getAudit().getLastModifiedBy().getUsername());
        formContract.setCreatedDateTime(form.getAudit().getCreatedDateTime());
        formContract.setModifiedDateTime(form.getAudit().getLastModifiedDateTime());
        formContract.setDecisionRule(form.getDecisionRule());
        formContract.setVisitScheduleRule(form.getVisitScheduleRule());
        formContract.setValidationRule(form.getValidationRule());
        formContract.setChecklistsRule(form.getChecklistsRule());
        formContract.setOrganisationId(form.getOrganisationId());

        form.getFormElementGroups().stream().sorted(Comparator.comparingDouble(FormElementGroup::getDisplayOrder)).forEach(formElementGroup -> {
            FormElementGroupContract formElementGroupContract = new FormElementGroupContract(formElementGroup.getUuid(), null, formElementGroup.getName(), formElementGroup.getDisplayOrder());
            formElementGroupContract.setDisplay(formElementGroup.getDisplay());
            formElementGroupContract.setVoided(formElementGroup.isVoided());
            formElementGroupContract.setOrganisationId(formElementGroup.getOrganisationId());
            formElementGroupContract.setRule(formElementGroup.getRule());
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
    @PreAuthorize(value = "hasAnyAuthority('admin', 'user', 'organisation_admin')")
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
    @PreAuthorize(value = "hasAnyAuthority('admin', 'user', 'organisation_admin')")
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

//    @RequestMapping(value = "/forms/byCategory", method = RequestMethod.GET)
//    @PreAuthorize(value = "hasAnyAuthority('admin', 'user', 'organisation_admin')")
//    public Map<String, List<BasicFormMetadata>> getFormsByCategory(Pageable pageable) {
//
//        Map<String, List<BasicFormMetadata>> categorisedForms = new HashMap<>();
//
//        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
//        List<FormMapping> programFormMappings = formMappingRepository.findAllByProgramIdIsNotNull();
//        List<FormMapping> encounterFormMappings = formMappingRepository.findAllByProgramIdIsNullAndEncounterTypeIdIsNotNull();
//        List<FormMapping> otherFormMappings = formMappingRepository.findAllByProgramIdIsNullAndEncounterTypeIdIsNull();
//
//        if (organisation.getId() != 1) { // filter by operational_modules
//            programFormMappings = programFormMappings.stream().filter(x ->
//                    operationalProgramRepository.findByProgramIdAndOrganisationId(x.getProgramId(), organisation.getId()) != null &&
//                            operationalProgramRepository.findByProgramIdAndOrganisationId(x.getProgramId(),
//                                    organisation.getId()).getProgram().getId().equals(x.getProgramId())
//            ).collect(Collectors.toList());
//
//            encounterFormMappings = encounterFormMappings.stream().filter(x ->
//                    operationalEncounterTypeRepository.findByEncounterTypeIdAndOrganisationId(x.getEncounterTypeId(), organisation.getId()) != null &&
//                            operationalEncounterTypeRepository.findByEncounterTypeIdAndOrganisationId(x.getEncounterTypeId(), organisation.getId()).getEncounterTypeUuid().getId().equals(x.getEncounterTypeId())
//            ).collect(Collectors.toList());
//        } else { // if organisation is OpenCHS, filter out other organisation forms
//            encounterFormMappings = encounterFormMappings.stream().filter(x -> x.getOrganisationId() == 1).collect(Collectors.toList());
//            otherFormMappings = otherFormMappings.stream().filter(x -> x.getOrganisationId() == 1).collect(Collectors.toList());
//        }
//
//        // Group by programId
//        Map<Long, List<FormMapping>> prgmIdFormMappingsMap = programFormMappings.stream()
//                .collect(Collectors.groupingBy(FormMapping::getProgramId));
//        for (Map.Entry<Long, List<FormMapping>> entry: prgmIdFormMappingsMap.entrySet()) {
//            String programName = programRepository.findById(entry.getKey()).getName();
//            List<BasicFormMetadata> forms = entry.getValue().stream().map(fm -> {
//                return new BasicFormMetadata(fm.getForm());
//            }).collect(Collectors.toList());
//            categorisedForms.put(programName, forms);
//        }
//
//        if (!encounterFormMappings.isEmpty()) {
//            categorisedForms.put("Non Program", encounterFormMappings.stream().map(fm -> {
//                return new BasicFormMetadata(fm.getForm());
//            }).collect(Collectors.toList()));
//        }
//        if (!otherFormMappings.isEmpty()) {
//            categorisedForms.put("Other", otherFormMappings.stream().map(fm -> {
//                return new BasicFormMetadata(fm.getForm());
//            }).collect(Collectors.toList()));
//        }
//
//        return categorisedForms;
//    }

    @GetMapping(value = "/web/form/{uuid}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public FormWebProjection getFormForWeb(@PathVariable String uuid) {
        return projectionFactory.createProjection(FormWebProjection.class, formRepository.findByUuid(uuid));
    }
}
