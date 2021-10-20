package org.avni.web;

import org.avni.web.response.Response;
import org.avni.web.response.SyncSubjectResponse;
import org.joda.time.DateTime;
import org.avni.dao.*;
import org.avni.domain.*;
import org.avni.geo.Point;
import org.avni.projection.IndividualWebProjection;
import org.avni.service.*;
import org.avni.web.request.*;
import org.avni.web.request.rules.RulesContractWrapper.Decisions;
import org.avni.web.request.rules.RulesContractWrapper.IndividualContractWrapper;
import org.avni.web.request.rules.constructWrappers.ProgramEnrolmentConstructionService;
import org.avni.web.request.webapp.search.SubjectSearchRequest;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.*;
import java.util.stream.Collectors;

import static org.springframework.data.jpa.domain.Specifications.where;

@RestController
public class IndividualController extends AbstractController<Individual> implements RestControllerResourceProcessor<Individual>, OperatingIndividualScopeAwareController<Individual> {
    private static org.slf4j.Logger logger = LoggerFactory.getLogger(IndividualController.class);
    private final IndividualRepository individualRepository;
    private final LocationRepository locationRepository;
    private final GenderRepository genderRepository;
    private final ObservationService observationService;
    private final UserService userService;
    private final SubjectTypeRepository subjectTypeRepository;
    private final ProjectionFactory projectionFactory;
    private final IndividualService individualService;
    private final EncounterService encounterService;
    private final IndividualSearchService individualSearchService;
    private final IdentifierAssignmentRepository identifierAssignmentRepository;
    private final ProgramEnrolmentConstructionService programEnrolmentConstructionService;
    private SubjectSyncResponseBuilderService subjectSyncResponseBuilderService;

    @Autowired
    public IndividualController(IndividualRepository individualRepository,
                                LocationRepository locationRepository,
                                GenderRepository genderRepository,
                                ObservationService observationService,
                                UserService userService,
                                SubjectTypeRepository subjectTypeRepository,
                                ProjectionFactory projectionFactory,
                                IndividualService individualService,
                                EncounterService encounterService,
                                IndividualSearchService individualSearchService,
                                IdentifierAssignmentRepository identifierAssignmentRepository,
                                ProgramEnrolmentConstructionService programEnrolmentConstructionService,
                                SubjectSyncResponseBuilderService subjectSyncResponseBuilderService
    ) {
        this.individualRepository = individualRepository;
        this.locationRepository = locationRepository;
        this.genderRepository = genderRepository;
        this.observationService = observationService;
        this.userService = userService;
        this.subjectTypeRepository = subjectTypeRepository;
        this.projectionFactory = projectionFactory;
        this.individualService = individualService;
        this.encounterService = encounterService;
        this.individualSearchService = individualSearchService;
        this.identifierAssignmentRepository = identifierAssignmentRepository;
        this.programEnrolmentConstructionService = programEnrolmentConstructionService;
        this.subjectSyncResponseBuilderService = subjectSyncResponseBuilderService;
    }

    @RequestMapping(value = "/individuals", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public void save(@RequestBody IndividualRequest individualRequest) {
        logger.info(String.format("Saving individual with UUID %s", individualRequest.getUuid()));

        Individual individual = createIndividualWithoutObservations(individualRequest);
        individual.setObservations(observationService.createObservations(individualRequest.getObservations()));
        addObservationsFromDecisions(individual, individualRequest.getDecisions());
        individualRepository.save(individual);
        saveVisitSchedules(individualRequest);
        saveIdentifierAssignments(individual, individualRequest);
        logger.info(String.format("Saved individual with UUID %s", individualRequest.getUuid()));
    }

    private void addObservationsFromDecisions(Individual individual, Decisions decisions) {
        if (decisions != null) {
            ObservationCollection observationsFromDecisions = observationService
                    .createObservationsFromDecisions(decisions.getRegistrationDecisions());
            individual.getObservations().putAll(observationsFromDecisions);
        }
    }

    private void saveVisitSchedules(IndividualRequest individualRequest) {
        if (individualRequest.getVisitSchedules() != null && individualRequest.getVisitSchedules().size() > 0) {
            encounterService.saveVisitSchedules(individualRequest.getUuid(), individualRequest.getVisitSchedules(), null);
        }
    }

    private void saveIdentifierAssignments(Individual individual, IndividualRequest individualRequest) {
        List<String> identifierAssignmentUuids = individualRequest.getIdentifierAssignmentUuids();
        if (identifierAssignmentUuids != null) {
            identifierAssignmentUuids.forEach(uuid -> {
                IdentifierAssignment identifierAssignment = identifierAssignmentRepository.findByUuid(uuid);
                identifierAssignment.setIndividual(individual);
                identifierAssignmentRepository.save(identifierAssignment);
            });
        }
    }


    @GetMapping(value = {"/individual", /*-->Both are Deprecated */ "/individual/search/byCatchmentAndLastModified", "/individual/search/lastModified"})
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<Individual>> getIndividualsByOperatingIndividualScope(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            @RequestParam(value = "subjectTypeUuid", required = false) String subjectTypeUuid,
            Pageable pageable) {
        if (subjectTypeUuid.isEmpty()) return wrap(new PageImpl<>(Collections.emptyList()));
        SubjectType subjectType = subjectTypeRepository.findByUuid(subjectTypeUuid);
        if (subjectType == null) return wrap(new PageImpl<>(Collections.emptyList()));
        return wrap(getCHSEntitiesForUserByLastModifiedDateTimeAndFilterByType(userService.getCurrentUser(), lastModifiedDateTime, now, subjectType.getId(), pageable));
    }

    @GetMapping(value = "/individual/search")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public Page<IndividualWebProjection> search(
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "subjectTypeUUID", required = false) String subjectTypeUUID,
            Pageable pageable) {
        IndividualRepository repo = this.individualRepository;
        return repo.findAll(
                where(repo.getFilterSpecForName(name))
                        .and(repo.getFilterSpecForSubjectTypeId(subjectTypeUUID))
                        .and(repo.getFilterSpecForVoid(false))
                , pageable)
                .map(t -> projectionFactory.createProjection(IndividualWebProjection.class, t));
    }

    @PostMapping(value = "/web/searchAPI/v2")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public ResponseEntity<LinkedHashMap<String, Object>> searchSubjects(@RequestBody SubjectSearchRequest subjectSearchRequest) {
        return new ResponseEntity<>(individualSearchService.search(subjectSearchRequest), HttpStatus.OK);
    }

    @GetMapping(value = "/web/individual/{uuid}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public IndividualWebProjection getOneForWeb(@PathVariable String uuid) {
        return projectionFactory.createProjection(IndividualWebProjection.class, individualRepository.findByUuid(uuid));
    }

    @GetMapping(value = "/web/subjectProfile")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public ResponseEntity<IndividualContract> getSubjectProfile(@RequestParam("uuid") String uuid) {
        IndividualContract individualContract = individualService.getSubjectInfo(uuid);
        return ResponseEntity.ok(individualContract);
    }

    @GetMapping(value = "/web/subject/{subjectUuid}/programs")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public ResponseEntity<IndividualContract> getSubjectProgramEnrollment(@PathVariable("subjectUuid") String uuid) {
        IndividualContract individualEnrolmentContract = individualService.getSubjectProgramEnrollment(uuid);
        if (individualEnrolmentContract == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(individualEnrolmentContract);
    }

    @GetMapping(value = "/web/subject/{uuid}/encounters")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public ResponseEntity<IndividualContract> getSubjectEncounters(@PathVariable("uuid") String uuid) {
        IndividualContract individualEncounterContract = individualService.getSubjectEncounters(uuid);
        if (individualEncounterContract == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(individualEncounterContract);
    }

    @GetMapping("/web/subject/{uuid}/completed")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public Page<EncounterContract> getAllCompletedEncounters(
            @PathVariable String uuid,
            @RequestParam(value = "encounterDateTime", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime encounterDateTime,
            @RequestParam(value = "earliestVisitDateTime", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime earliestVisitDateTime,
            @RequestParam(value = "encounterTypeUuids", required = false) String encounterTypeUuids,
            Pageable pageable) {
        return encounterService.getAllCompletedEncounters(uuid, encounterTypeUuids, encounterDateTime, earliestVisitDateTime, pageable);
    }

    @DeleteMapping("/web/subject/{uuid}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    @Transactional
    public ResponseEntity<?> voidSubject(@PathVariable String uuid) {
        Individual individual = individualRepository.findByUuid(uuid);
        if (individual == null) {
            ResponseEntity.notFound().build();
        }
        Individual voidedIndividual = individualService.voidSubject(individual);
        return ResponseEntity.ok(voidedIndividual);
    }

    @GetMapping("/subject/search")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public List<IndividualContractWrapper> getAllSubjects(@RequestParam String addressLevelUUID,
                                                          @RequestParam String subjectTypeName) {
        AddressLevel addressLevel = locationRepository.findByUuid(addressLevelUUID);
        SubjectType subjectType = subjectTypeRepository.findByName(subjectTypeName);
        List<Individual> individuals = individualRepository.findAllByAddressLevelAndSubjectTypeAndIsVoidedFalse(addressLevel, subjectType);
        return individuals.stream().map(programEnrolmentConstructionService::getSubjectInfo).collect(Collectors.toList());
    }

    @GetMapping("/subject/{uuid}/allEntities")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public Resource<SyncSubjectResponse> getSubjectDetailsForSync(@PathVariable String uuid) {
        return new Resource<>(subjectSyncResponseBuilderService.getSubject(uuid)) ;
    }

    @Override
    public Resource<Individual> process(Resource<Individual> resource) {
        Individual individual = resource.getContent();
        resource.removeLinks();
        if (individual.getAddressLevel() != null) {
            resource.add(new Link(individual.getAddressLevel().getUuid(), "addressUUID"));
        }
        if (individual.getGender() != null) {
            resource.add(new Link(individual.getGender().getUuid(), "genderUUID"));
        }
        if (individual.getSubjectType() != null) {
            resource.add(new Link(individual.getSubjectType().getUuid(), "subjectTypeUUID"));
        }
        return resource;
    }

    private Individual createIndividualWithoutObservations(@RequestBody IndividualRequest individualRequest) {
        AddressLevel addressLevel = getAddressLevel(individualRequest);
        Gender gender = individualRequest.getGender() == null ? genderRepository.findByUuid(individualRequest.getGenderUUID()) : genderRepository.findByName(individualRequest.getGender());
        SubjectType subjectType = individualRequest.getSubjectTypeUUID() == null ? subjectTypeRepository.findByUuid("9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3") : subjectTypeRepository.findByUuid(individualRequest.getSubjectTypeUUID());
        Individual individual = newOrExistingEntity(individualRepository, individualRequest, new Individual());
        individual.setSubjectType(subjectType);
        individual.setFirstName(individualRequest.getFirstName());
        individual.setLastName(individualRequest.getLastName());
        individual.setDateOfBirth(individualRequest.getDateOfBirth());
        individual.setAddressLevel(addressLevel);
        individual.setGender(gender);
        individual.setRegistrationDate(individualRequest.getRegistrationDate());
        individual.setVoided(individualRequest.isVoided());
        individual.setFacility(userService.getUserFacility());
        PointRequest pointRequest = individualRequest.getRegistrationLocation();
        if (pointRequest != null)
            individual.setRegistrationLocation(new Point(pointRequest.getX(), pointRequest.getY()));
        return individual;
    }

    private AddressLevel getAddressLevel(@RequestBody IndividualRequest individualRequest) {
        if (individualRequest.getAddressLevelUUID() != null) {
            return locationRepository.findByUuid(individualRequest.getAddressLevelUUID());
        } else if (individualRequest.getCatchmentUUID() != null) {
            return locationRepository.findByTitleAndCatchmentsUuid(individualRequest.getAddressLevel(), individualRequest.getCatchmentUUID());
        } else {
            return locationRepository.findByTitleIgnoreCase(individualRequest.getAddressLevel());
        }
    }

    @Override
    public OperatingIndividualScopeAwareRepository<Individual> repository() {
        return individualRepository;
    }
}
