package org.openchs.web;

import org.joda.time.DateTime;
import org.openchs.dao.*;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.Gender;
import org.openchs.domain.Individual;
import org.openchs.domain.SubjectType;
import org.openchs.geo.Point;
import org.openchs.projection.IndividualWebProjection;
import org.openchs.service.IndividualService;
import org.openchs.service.ObservationService;
import org.openchs.service.UserService;
import org.openchs.web.request.EnrolmentContract;
import org.openchs.web.request.IndividualContract;
import org.openchs.web.request.IndividualRequest;
import org.openchs.web.request.PointRequest;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.Objects;

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

    @Autowired
    public IndividualController(IndividualRepository individualRepository, LocationRepository locationRepository, GenderRepository genderRepository, ObservationService observationService, UserService userService, SubjectTypeRepository subjectTypeRepository, ProjectionFactory projectionFactory, IndividualService individualService) {
        this.individualRepository = individualRepository;
        this.locationRepository = locationRepository;
        this.genderRepository = genderRepository;
        this.observationService = observationService;
        this.userService = userService;
        this.subjectTypeRepository = subjectTypeRepository;
        this.projectionFactory = projectionFactory;
        this.individualService = individualService;
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
            Pageable pageable) {
        return wrap(getCHSEntitiesForUserByLastModifiedDateTime(userService.getCurrentUser(), lastModifiedDateTime, now, pageable));
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
        if (query != null && !"".equals(query.trim())) {
            return repo.findAll(
                    where(repo.getFilterSpecForOperatingSubjectScope(userService.getCurrentUser())).and(
                            where(repo.getFilterSpecForAddress(query))
                                    .or(repo.getFilterSpecForObs(query))
                                    .or(repo.getFilterSpecForName(query))
                    ), pageable)
                    .map(t -> projectionFactory.createProjection(IndividualWebProjection.class, t));
        }
        return repo.findAll(
                where(repo.getFilterSpecForOperatingSubjectScope(userService.getCurrentUser()))
                        .and(repo.getFilterSpecForVoid(includeVoided))
                        .and(repo.getFilterSpecForName(name))
                        .and(repo.getFilterSpecForObs(obs))
                        .and(repo.getFilterSpecForLocationIds(locationIds))
                , pageable)
                .map(t -> projectionFactory.createProjection(IndividualWebProjection.class, t));
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
        IndividualContract individualContract =  individualService.getSubjectInfo(uuid);
        return ResponseEntity.ok(individualContract);
    }

    @GetMapping(value = "/web/subject/{subjectUuid}/programs")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public ResponseEntity<IndividualContract> getSubjectProgramEnrollment(@PathVariable("subjectUuid") String uuid) {
        IndividualContract individualEnrolmentContract =  individualService.getSubjectProgramEnrollment(uuid);
        if(individualEnrolmentContract == null){
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(individualEnrolmentContract);
    }

    @GetMapping(value = "/web/subject/{uuid}/encounters")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public ResponseEntity<IndividualContract> getSubjectEncounters(@PathVariable("uuid") String uuid) {
        IndividualContract individualEncounterContract =  individualService.getSubjectEncounters(uuid);
        if(individualEncounterContract == null){
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(individualEncounterContract);
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
}
