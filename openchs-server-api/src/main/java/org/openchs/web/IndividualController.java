package org.openchs.web;

import org.joda.time.DateTime;
import org.openchs.dao.*;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.Gender;
import org.openchs.domain.Individual;
import org.openchs.domain.SubjectType;
import org.openchs.geo.Point;
import org.openchs.projection.IndividualWebProjection;
import org.openchs.service.*;
import org.openchs.util.S;
import org.openchs.web.request.*;
import org.openchs.web.response.ResponsePage;
import org.openchs.web.response.SubjectResponse;
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
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

import static org.springframework.data.jpa.domain.Specifications.where;

@RestController
public class IndividualController extends AbstractController<Individual> implements RestControllerResourceProcessor<Individual>, OperatingIndividualScopeAwareController<Individual>, OperatingIndividualScopeAwareFilterController<Individual> {
    private static org.slf4j.Logger logger = LoggerFactory.getLogger(IndividualController.class);
    private final IndividualRepository individualRepository;
    private final LocationRepository locationRepository;
    private final GenderRepository genderRepository;
    private final ObservationService observationService;
    private final UserService userService;
    private final SubjectTypeRepository subjectTypeRepository;
    private final ProjectionFactory projectionFactory;
    private final IndividualService individualService;
    private ConceptRepository conceptRepository;
    private ConceptService conceptService;
    private final EncounterService encounterService;
    private final IndividualSearchService individualSearchService;

    @Autowired
    public IndividualController(IndividualRepository individualRepository, LocationRepository locationRepository, GenderRepository genderRepository, ObservationService observationService, UserService userService, SubjectTypeRepository subjectTypeRepository, ProjectionFactory projectionFactory, IndividualService individualService, ConceptRepository conceptRepository, ConceptService conceptService,EncounterService encounterService,IndividualSearchService individualSearchService) {
        this.individualRepository = individualRepository;
        this.locationRepository = locationRepository;
        this.genderRepository = genderRepository;
        this.observationService = observationService;
        this.userService = userService;
        this.subjectTypeRepository = subjectTypeRepository;
        this.projectionFactory = projectionFactory;
        this.individualService = individualService;
        this.conceptRepository = conceptRepository;
        this.conceptService = conceptService;
        this.encounterService = encounterService;
        this.individualSearchService=individualSearchService;
    }

    @RequestMapping(value = "/api/subjects", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public ResponsePage getSubjects(@RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
                                    @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
                                    @RequestParam(value = "subjectType", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) String subjectType,
                                    Pageable pageable) {
        Page<Individual> subjects;
        boolean subjectTypeRequested = S.isEmpty(subjectType);
        if (subjectTypeRequested) {
            subjects = individualRepository.findByAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(lastModifiedDateTime, now, pageable);
        } else
            subjects = individualRepository.findByAuditLastModifiedDateTimeIsBetweenAndSubjectTypeNameOrderByAuditLastModifiedDateTimeAscIdAsc(lastModifiedDateTime, now, subjectType, pageable);
        ArrayList<SubjectResponse> subjectResponses = new ArrayList<>();
        subjects.forEach(subject -> {
            subjectResponses.add(SubjectResponse.fromSubject(subject, subjectTypeRequested, conceptRepository, conceptService));
        });
        return new ResponsePage(subjectResponses, subjects.getNumberOfElements(), subjects.getTotalPages(), subjects.getSize());
    }

    @GetMapping(value = "/api/subject/{id}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public ResponseEntity<SubjectResponse> get(@PathVariable("id") String uuid) {
        Individual subject = individualRepository.findByUuid(uuid);
        if (subject == null)
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(SubjectResponse.fromSubject(subject, true, conceptRepository, conceptService), HttpStatus.OK);
    }

    @RequestMapping(value = "/individuals", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public void save(@RequestBody IndividualRequest individualRequest) {
        logger.info(String.format("Saving individual with UUID %s", individualRequest.getUuid()));

        Individual individual = createIndividualWithoutObservations(individualRequest);
        individual.setObservations(observationService.createObservations(individualRequest.getObservations()));
        individualRepository.save(individual);
        logger.info(String.format("Saved individual with UUID %s", individualRequest.getUuid()));
    }

    @GetMapping(value = {"/individual", /*-->Both are Deprecated */ "/individual/search/byCatchmentAndLastModified", "/individual/search/lastModified"})
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public PagedResources<Resource<Individual>> getIndividualsByOperatingIndividualScope(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            @RequestParam(value = "subjectTypeUuid", required = false) String subjectTypeUuid,
            Pageable pageable) {
        if (subjectTypeUuid == null) {
            return wrap(getCHSEntitiesForUserByLastModifiedDateTime(userService.getCurrentUser(), lastModifiedDateTime, now, pageable));
        } else {
            return subjectTypeUuid.isEmpty() ? wrap(new PageImpl<>(Collections.emptyList())) :
                    wrap(getCHSEntitiesForUserByLastModifiedDateTimeAndFilterByType(userService.getCurrentUser(), lastModifiedDateTime, now, subjectTypeUuid, pageable));
        }
    }

    @GetMapping(value = "/individual/search")
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    @ResponseBody
    public Page<IndividualWebProjection> search(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "includeVoided", defaultValue = "false") Boolean includeVoided,
            @RequestParam(value = "obs", required = false) String obs,
            @RequestParam(value = "locationIds", required = false) List<Long> locationIds,
            Pageable pageable) {
        IndividualRepository repo = this.individualRepository;
//        if (query != null && !"".equals(query.trim())) {
//            return repo.findAll(
//                            where(repo.getFilterSpecForName(query))
//                                    .or(repo.getFilterSpecForObs(query))
//                                    .or(repo.getFilterSpecForAddress(query))
//                    , pageable)
//                    .map(t -> projectionFactory.createProjection(IndividualWebProjection.class, t));
//        }
//        return repo.findAll(
//                where(repo.getFilterSpecForName(name))
//                        .and(repo.getFilterSpecForVoid(includeVoided))
//                        .and(repo.getFilterSpecForObs(obs))
//                        .and(repo.getFilterSpecForLocationIds(locationIds))
//                , pageable)
//                .map(t -> projectionFactory.createProjection(IndividualWebProjection.class, t));
        return repo.findAll(
                where(repo.getFilterSpecForName(query))
                , pageable)
                .map(t -> projectionFactory.createProjection(IndividualWebProjection.class, t));
    }

    @PostMapping(value= "/web/searchAPI/v2")
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    @ResponseBody
    public List<IndividualContract> getSearch(@RequestBody String searchQuery) {
        return individualSearchService.getsearchResult(searchQuery);
    }

    @GetMapping(value = "/web/individual/{uuid}")
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    @ResponseBody
    public IndividualWebProjection getOneForWeb(@PathVariable String uuid) {
        return projectionFactory.createProjection(IndividualWebProjection.class, individualRepository.findByUuid(uuid));
    }

    @GetMapping(value = "/web/subjectProfile")
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    @ResponseBody
    public ResponseEntity<IndividualContract> getSubjectProfile(@RequestParam("uuid") String uuid) {
        IndividualContract individualContract = individualService.getSubjectInfo(uuid);
        return ResponseEntity.ok(individualContract);
    }

    @GetMapping(value = "/web/subject/{subjectUuid}/programs")
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    @ResponseBody
    public ResponseEntity<IndividualContract> getSubjectProgramEnrollment(@PathVariable("subjectUuid") String uuid) {
        IndividualContract individualEnrolmentContract = individualService.getSubjectProgramEnrollment(uuid);
        if (individualEnrolmentContract == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(individualEnrolmentContract);
    }

    @GetMapping(value = "/web/subject/{uuid}/encounters")
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    @ResponseBody
    public ResponseEntity<IndividualContract> getSubjectEncounters(@PathVariable("uuid") String uuid) {
        IndividualContract individualEncounterContract = individualService.getSubjectEncounters(uuid);
        if (individualEncounterContract == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(individualEncounterContract);
    }

    @GetMapping("/web/subject/{uuid}/completed")
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    @ResponseBody
    public Page<EncounterContract> getAllCompletedEncounters(
            @PathVariable String uuid,
            @RequestParam(value = "encounterDateTime", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime encounterDateTime,
            @RequestParam(value = "earliestVisitDateTime", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime earliestVisitDateTime,
            @RequestParam(value = "encounterTypeUuids",required = false) String encounterTypeUuids,
            Pageable pageable) {
        return encounterService.getAllCompletedEncounters(uuid,encounterTypeUuids,encounterDateTime,earliestVisitDateTime,pageable);
    }

    @Override
    public Resource<Individual> process(Resource<Individual> resource) {
        Individual individual = resource.getContent();
        resource.removeLinks();
        resource.add(new Link(individual.getAddressLevel().getUuid(), "addressUUID"));
        if (individual.getGender() != null) {
            resource.add(new Link(individual.getGender().getUuid(), "genderUUID"));
        }
        if (individual.getSubjectType() != null) {
            resource.add(new Link(individual.getSubjectType().getUuid(), "subjectTypeUUID"));
        }
        return resource;
    }

    @Override
    public OperatingIndividualScopeAwareRepository<Individual> resourceRepository() {
        return individualRepository;
    }

    private Individual createIndividualWithoutObservations(@RequestBody IndividualRequest individualRequest) {
        AddressLevel addressLevel = getAddressLevel(individualRequest);
        Objects.requireNonNull(addressLevel, String.format("Individual{uuid='%s',addressLevel='%s'} addressLevel doesn't exist.",
                individualRequest.getUuid(), individualRequest.getAddressLevel()));
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
    public OperatingIndividualScopeAwareRepositoryWithTypeFilter<Individual> repository() {
        return individualRepository;
    }
}
