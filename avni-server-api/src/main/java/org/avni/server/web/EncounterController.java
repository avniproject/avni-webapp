package org.avni.server.web;

import com.bugsnag.Bugsnag;
import org.avni.server.application.FormMapping;
import org.avni.server.application.FormType;
import org.avni.server.dao.EncounterRepository;
import org.avni.server.dao.EncounterTypeRepository;
import org.avni.server.dao.IndividualRepository;
import org.avni.server.dao.SyncParameters;
import org.avni.server.domain.*;
import org.avni.server.geo.Point;
import org.avni.server.service.*;
import org.avni.server.web.request.rules.RulesContractWrapper.Decisions;
import org.avni.server.web.request.EncounterContract;
import org.avni.server.web.request.EncounterRequest;
import org.avni.server.web.request.PointRequest;
import org.joda.time.DateTime;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.Collections;

@RestController
public class EncounterController extends AbstractController<Encounter> implements RestControllerResourceProcessor<Encounter> {
    private static org.slf4j.Logger logger = LoggerFactory.getLogger(IndividualController.class);
    private final IndividualRepository individualRepository;
    private final EncounterTypeRepository encounterTypeRepository;
    private final EncounterRepository encounterRepository;
    private final ObservationService observationService;
    private final UserService userService;
    private Bugsnag bugsnag;
    private final EncounterService encounterService;
    private ScopeBasedSyncService<Encounter> scopeBasedSyncService;
    private FormMappingService formMappingService;

    @Autowired
    public EncounterController(IndividualRepository individualRepository,
                               EncounterTypeRepository encounterTypeRepository,
                               EncounterRepository encounterRepository,
                               ObservationService observationService,
                               UserService userService,
                               Bugsnag bugsnag,
                               EncounterService encounterService, ScopeBasedSyncService<Encounter> scopeBasedSyncService, FormMappingService formMappingService) {
        this.individualRepository = individualRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.encounterRepository = encounterRepository;
        this.observationService = observationService;
        this.userService = userService;
        this.bugsnag = bugsnag;
        this.encounterService = encounterService;
        this.scopeBasedSyncService = scopeBasedSyncService;
        this.formMappingService = formMappingService;
    }

    @GetMapping(value = "/web/encounter/{uuid}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public ResponseEntity<EncounterContract> getEncounterByUuid(@PathVariable("uuid") String uuid) {
        EncounterContract encounterContract = encounterService.getEncounterByUuid(uuid);
        if (encounterContract == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(encounterContract);
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
    @PreAuthorize(value = "hasAnyAuthority('user')")
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
        if (decisions != null) {
            ObservationCollection observationsFromDecisions = observationService
                    .createObservationsFromDecisions(decisions.getEncounterDecisions());
            if (decisions.isCancel()) {
                encounter.getCancelObservations().putAll(observationsFromDecisions);
            } else {
                encounter.getObservations().putAll(observationsFromDecisions);
            }
        }
        encounterService.save(encounter);
        if (request.getVisitSchedules() != null && request.getVisitSchedules().size() > 0) {
            encounterService.saveVisitSchedules(individual.getUuid(), request.getVisitSchedules(), request.getUuid());
        }
        logger.info(String.format("Saved encounter with uuid %s", request.getUuid()));
    }

    @RequestMapping(value = "/encounter/search/byIndividualsOfCatchmentAndLastModified", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<Encounter>> getEncountersByCatchmentAndLastModified(
            @RequestParam("catchmentId") long catchmentId,
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(encounterRepository.findByIndividualAddressLevelVirtualCatchmentsIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(catchmentId, CHSEntity.toDate(lastModifiedDateTime), CHSEntity.toDate(now), pageable));
    }

    @RequestMapping(value = "/encounter/search/lastModified", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<Encounter>> getEncountersByLastModified(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(encounterRepository.findByLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(CHSEntity.toDate(lastModifiedDateTime), CHSEntity.toDate(now), pageable));
    }

    @RequestMapping(value = "/encounter", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<Encounter>> getEncountersByOperatingIndividualScope(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            @RequestParam(value = "encounterTypeUuid", required = false) String encounterTypeUuid,
            Pageable pageable) throws Exception {
        if (encounterTypeUuid.isEmpty()) return wrap(new PageImpl<>(Collections.emptyList()));
        EncounterType encounterType = encounterTypeRepository.findByUuid(encounterTypeUuid);
        if (encounterType == null) return wrap(new PageImpl<>(Collections.emptyList()));
        FormMapping formMapping = formMappingService.find(encounterType, FormType.Encounter);
        if (formMapping == null)
            throw new Exception(String.format("No form mapping found for encounter %s", encounterType.getName()));
        return wrap(scopeBasedSyncService.getSyncResultsBySubjectTypeRegistrationLocation(encounterRepository, userService.getCurrentUser(), lastModifiedDateTime, now, encounterType.getId(), pageable, formMapping.getSubjectType(), SyncParameters.SyncEntityName.Encounter));
    }

    @DeleteMapping("/web/encounter/{uuid}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
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

}
