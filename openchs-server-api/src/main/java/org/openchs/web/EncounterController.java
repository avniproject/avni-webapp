package org.openchs.web;

import org.joda.time.DateTime;
import org.openchs.dao.EncounterRepository;
import org.openchs.dao.EncounterTypeRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.dao.OperatingIndividualScopeAwareRepository;
import org.openchs.domain.Encounter;
import org.openchs.domain.EncounterType;
import org.openchs.domain.Individual;
import org.openchs.geo.Point;
import org.openchs.service.UserService;
import org.openchs.web.request.EncounterRequest;
import org.openchs.service.ObservationService;
import org.openchs.web.request.PointRequest;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;

@RestController
public class EncounterController extends AbstractController<Encounter> implements RestControllerResourceProcessor<Encounter>, OperatingIndividualScopeAwareController<Encounter> {
    private final IndividualRepository individualRepository;
    private final EncounterTypeRepository encounterTypeRepository;
    private final EncounterRepository encounterRepository;
    private final ObservationService observationService;
    private final UserService userService;

    private static org.slf4j.Logger logger = LoggerFactory.getLogger(IndividualController.class);

    @Autowired
    public EncounterController(IndividualRepository individualRepository, EncounterTypeRepository encounterTypeRepository, EncounterRepository encounterRepository, ObservationService observationService, UserService userService) {
        this.individualRepository = individualRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.encounterRepository = encounterRepository;
        this.observationService = observationService;
        this.userService = userService;
    }

    @RequestMapping(value = "/encounters", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public void save(@RequestBody EncounterRequest encounterRequest) {
        logger.info("Saving encounter with uuid %s", encounterRequest.getUuid());

        EncounterType encounterType;
        if (encounterRequest.getEncounterTypeUUID() == null) {
            encounterType = encounterTypeRepository.findByName(encounterRequest.getEncounterType());
        } else {
            encounterType = encounterTypeRepository.findByUuid(encounterRequest.getEncounterTypeUUID());
        }
        Individual individual = individualRepository.findByUuid(encounterRequest.getIndividualUUID());
        if (individual == null) {
            throw new IllegalArgumentException(String.format("Individual not found with UUID '%s'", encounterRequest.getIndividualUUID()));
        }

        Encounter encounter = newOrExistingEntity(encounterRepository, encounterRequest, new Encounter());
        encounter.setEncounterDateTime(encounterRequest.getEncounterDateTime());
        encounter.setIndividual(individual);
        encounter.setEncounterType(encounterType);
        encounter.setObservations(observationService.createObservations(encounterRequest.getObservations()));
        encounter.setVoided(encounterRequest.isVoided());
        PointRequest encounterLocation = encounterRequest.getEncounterLocation();
        if(encounterLocation != null)
            encounter.setEncounterLocation(new Point(encounterLocation.getX(), encounterLocation.getY()));
        encounterRepository.save(encounter);

        logger.info("Saved encounter with uuid %s", encounterRequest.getUuid());
    }

    @RequestMapping(value = "/encounter/search/byIndividualsOfCatchmentAndLastModified", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<Encounter>> getEncountersByCatchmentAndLastModified(
            @RequestParam("catchmentId") long catchmentId,
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(encounterRepository.findByIndividualAddressLevelVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenAndIsVoidedFalseOrderByAuditLastModifiedDateTimeAscIdAsc(catchmentId, lastModifiedDateTime, now, pageable));
    }

    @RequestMapping(value = "/encounter/search/lastModified", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<Encounter>> getEncountersByLastModified(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(encounterRepository.findByAuditLastModifiedDateTimeIsBetweenAndIsVoidedFalseOrderByAudit_LastModifiedDateTimeAscIdAsc(lastModifiedDateTime, now, pageable));
    }

    @RequestMapping(value = "/encounter", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<Encounter>> getEncountersByOperatingIndividualScope(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(getCHSEntitiesForUserByLastModifiedDateTime(userService.getCurrentUser(), lastModifiedDateTime, now, pageable));
    }

    @Override
    public Resource<Encounter> process(Resource<Encounter> resource) {
        Encounter encounter = resource.getContent();
        resource.removeLinks();
        resource.add(new Link(encounter.getEncounterType().getUuid(), "encounterTypeUUID"));
        resource.add(new Link(encounter.getIndividual().getUuid(), "individualUUID"));
        return resource;
    }

    @Override
    public OperatingIndividualScopeAwareRepository<Encounter> resourceRepository() {
        return encounterRepository;
    }
}