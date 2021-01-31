package org.openchs.web;

import com.bugsnag.Bugsnag;
import org.joda.time.DateTime;
import org.openchs.dao.*;
import org.openchs.domain.*;
import org.openchs.geo.Point;
import org.openchs.service.ConceptService;
import org.openchs.service.EncounterService;
import org.openchs.service.ObservationService;
import org.openchs.service.UserService;
import org.openchs.util.BadRequestError;
import org.openchs.util.O;
import org.openchs.util.S;
import org.openchs.web.request.EncounterContract;
import org.openchs.web.request.EncounterRequest;
import org.openchs.web.request.PointRequest;
import org.openchs.web.request.rules.RulesContractWrapper.Decisions;
import org.openchs.web.response.EncounterResponse;
import org.openchs.web.response.ResponsePage;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
public class EncounterController extends AbstractController<Encounter> implements RestControllerResourceProcessor<Encounter>, OperatingIndividualScopeAwareController<Encounter>, OperatingIndividualScopeAwareFilterController<Encounter> {
    private static org.slf4j.Logger logger = LoggerFactory.getLogger(IndividualController.class);
    private final IndividualRepository individualRepository;
    private final EncounterTypeRepository encounterTypeRepository;
    private final EncounterRepository encounterRepository;
    private final ObservationService observationService;
    private final UserService userService;
    private Bugsnag bugsnag;
    private final ConceptRepository conceptRepository;
    private final ConceptService conceptService;
    private final EncounterService encounterService;

    @Autowired
    public EncounterController(IndividualRepository individualRepository,
                               EncounterTypeRepository encounterTypeRepository,
                               EncounterRepository encounterRepository,
                               ObservationService observationService,
                               UserService userService,
                               Bugsnag bugsnag,
                               ConceptRepository conceptRepository,
                               ConceptService conceptService,
                               EncounterService encounterService) {
        this.individualRepository = individualRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.encounterRepository = encounterRepository;
        this.observationService = observationService;
        this.userService = userService;
        this.bugsnag = bugsnag;
        this.conceptRepository = conceptRepository;
        this.conceptService = conceptService;
        this.encounterService = encounterService;
    }

    @RequestMapping(value = "/api/encounters", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public ResponsePage getEncounters(@RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
                                      @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
                                      @RequestParam(value = "encounterType", required = false) String encounterType,
                                      @RequestParam(value = "concepts", required = false) String concepts,
                                      Pageable pageable) {
        Page<Encounter> encounters;
        Map<Concept, String> conceptsMap = conceptService.readConceptsFromJsonObject(concepts);
        if (S.isEmpty(encounterType)) {
            encounters = encounterRepository.findByConcepts(lastModifiedDateTime, now, conceptsMap, pageable);
        } else {
            encounters = encounterRepository.findByConceptsAndEncounterType(lastModifiedDateTime, now, conceptsMap, encounterType, pageable);
        }

        ArrayList<EncounterResponse> encounterResponses = new ArrayList<>();
        encounters.forEach(encounter -> {
            encounterResponses.add(EncounterResponse.fromEncounter(encounter, conceptRepository, conceptService));
        });
        return new ResponsePage(encounterResponses, encounters.getNumberOfElements(), encounters.getTotalPages(), encounters.getSize());
    }

    @GetMapping(value = "/web/encounter/{uuid}")
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    @ResponseBody
    public ResponseEntity<EncounterContract> getEncounterByUuid(@PathVariable("uuid") String uuid) {
        EncounterContract encounterContract = encounterService.getEncounterByUuid(uuid);
        if (encounterContract == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(encounterContract);
    }

    @GetMapping(value = "/api/encounter/{id}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public ResponseEntity<EncounterResponse> get(@PathVariable("id") String uuid) {
        Encounter encounter = encounterRepository.findByUuid(uuid);
        if (encounter == null)
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(EncounterResponse.fromEncounter(encounter, conceptRepository, conceptService), HttpStatus.OK);
    }

    private void checkForSchedulingCompleteConstraintViolation(EncounterRequest request) {
        if ((request.getEarliestVisitDateTime() != null || request.getMaxVisitDateTime() != null)
                && (request.getEarliestVisitDateTime() == null || request.getMaxVisitDateTime() == null)
        ) {
            //violating constraint so notify bugsnag
            bugsnag.notify(new Exception(String.format("ProgramEncounter violating scheduling constraint uuid %s earliest %s max %s", request.getUuid(), request.getEarliestVisitDateTime(), request.getMaxVisitDateTime())));
        }
    }

    @RequestMapping(value = "/encounters", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public void save(@RequestBody EncounterRequest request) {
        logger.info("Saving encounter with uuid %s", request.getUuid());

        checkForSchedulingCompleteConstraintViolation(request);

        EncounterType encounterType = encounterTypeRepository.findByUuidOrName(request.getEncounterType(), request.getEncounterTypeUUID());
        Individual individual = individualRepository.findByUuid(request.getIndividualUUID());
        if (individual == null) {
            throw new IllegalArgumentException(String.format("Individual not found with UUID '%s'", request.getIndividualUUID()));
        }

        Encounter encounter = newOrExistingEntity(encounterRepository, request, new Encounter());
        //Planned visit can not overwrite completed encounter
        if (encounter.isCompleted() && request.isPlanned())
            return;

        encounter.setEncounterDateTime(request.getEncounterDateTime());
        encounter.setIndividual(individual);
        encounter.setEncounterType(encounterType);
        encounter.setObservations(observationService.createObservations(request.getObservations()));
        encounter.setName(request.getName());
        encounter.setEarliestVisitDateTime(request.getEarliestVisitDateTime());
        encounter.setMaxVisitDateTime(request.getMaxVisitDateTime());
        encounter.setCancelDateTime(request.getCancelDateTime());
        encounter.setCancelObservations(observationService.createObservations(request.getCancelObservations()));
        encounter.setVoided(request.isVoided());
        PointRequest encounterLocation = request.getEncounterLocation();
        if (encounterLocation != null)
            encounter.setEncounterLocation(new Point(encounterLocation.getX(), encounterLocation.getY()));
        PointRequest cancelLocation = request.getCancelLocation();
        if (cancelLocation != null)
            encounter.setCancelLocation(new Point(cancelLocation.getX(), cancelLocation.getY()));

        Decisions decisions = request.getDecisions();
        if(decisions != null) {
            ObservationCollection observationsFromDecisions = observationService
                    .createObservationsFromDecisions(decisions.getEncounterDecisions());
            if(decisions.isCancel()) {
                encounter.getCancelObservations().putAll(observationsFromDecisions);
            } else {
                encounter.getObservations().putAll(observationsFromDecisions);
            }
        }

        encounterRepository.save(encounter);
        if(request.getVisitSchedules() != null && request.getVisitSchedules().size() > 0) {
            encounterService.saveVisitSchedules(individual.getUuid(), request.getVisitSchedules(), request.getUuid());
        }
        logger.info(String.format("Saved encounter with uuid %s", request.getUuid()));
    }

    @RequestMapping(value = "/encounter/search/byIndividualsOfCatchmentAndLastModified", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public PagedResources<Resource<Encounter>> getEncountersByCatchmentAndLastModified(
            @RequestParam("catchmentId") long catchmentId,
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(encounterRepository.findByIndividualAddressLevelVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(catchmentId, lastModifiedDateTime, now, pageable));
    }

    @RequestMapping(value = "/encounter/search/lastModified", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public PagedResources<Resource<Encounter>> getEncountersByLastModified(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(encounterRepository.findByAuditLastModifiedDateTimeIsBetweenOrderByAudit_LastModifiedDateTimeAscIdAsc(lastModifiedDateTime, now, pageable));
    }

    @RequestMapping(value = "/encounter", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public PagedResources<Resource<Encounter>> getEncountersByOperatingIndividualScope(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            @RequestParam(value = "encounterTypeUuid", required = false) String encounterTypeUuid,
            Pageable pageable) {
        if (encounterTypeUuid == null) {
            return wrap(getCHSEntitiesForUserByLastModifiedDateTime(userService.getCurrentUser(), lastModifiedDateTime, now, pageable));
        } else {
            if (encounterTypeUuid.isEmpty()) return wrap(new PageImpl<>(Collections.emptyList()));
            EncounterType encounterType = encounterTypeRepository.findByUuid(encounterTypeUuid);
            if(encounterType == null) return wrap(new PageImpl<>(Collections.emptyList()));
            return wrap(getCHSEntitiesForUserByLastModifiedDateTimeAndFilterByType(userService.getCurrentUser(), lastModifiedDateTime, now, encounterType.getId(), pageable));
        }
    }

    @DeleteMapping("/web/encounter/{uuid}")
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    @ResponseBody
    @Transactional
    public ResponseEntity<?> voidSubject(@PathVariable String uuid) {
        Encounter encounter = encounterRepository.findByUuid(uuid);
        if (encounter == null) {
            return ResponseEntity.notFound().build();
        }
        encounter.setVoided(true);
        Encounter voidedEncounter = encounterRepository.save(encounter);
        return ResponseEntity.ok(voidedEncounter);
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

    @Override
    public OperatingIndividualScopeAwareRepositoryWithTypeFilter<Encounter> repository() {
        return encounterRepository;
    }
}
