package org.avni.web.api;

import org.avni.service.EncounterService;
import org.joda.time.DateTime;
import org.avni.dao.ConceptRepository;
import org.avni.dao.EncounterRepository;
import org.avni.dao.EncounterTypeRepository;
import org.avni.dao.IndividualRepository;
import org.avni.domain.*;
import org.avni.service.ConceptService;
import org.avni.util.S;
import org.avni.web.request.api.ApiEncounterRequest;
import org.avni.web.request.api.RequestUtils;
import org.avni.web.response.EncounterResponse;
import org.avni.web.response.ResponsePage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityExistsException;
import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.Map;

@RestController
public class GeneralEncounterApiController {
    private final ConceptService conceptService;
    private final EncounterRepository encounterRepository;
    private final ConceptRepository conceptRepository;
    private final IndividualRepository individualRepository;
    private final EncounterTypeRepository encounterTypeRepository;
    private final EncounterService encounterService;

    @Autowired
    public GeneralEncounterApiController(ConceptService conceptService, EncounterRepository encounterRepository, ConceptRepository conceptRepository, IndividualRepository individualRepository, EncounterTypeRepository encounterTypeRepository, EncounterService encounterService) {
        this.conceptService = conceptService;
        this.encounterRepository = encounterRepository;
        this.conceptRepository = conceptRepository;
        this.individualRepository = individualRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.encounterService = encounterService;
    }

    @RequestMapping(value = "/api/encounters", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public ResponsePage getEncounters(@RequestParam(value = "lastModifiedDateTime", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
                                      @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
                                      @RequestParam(value = "encounterType", required = false) String encounterType,
                                      @RequestParam(value = "subjectId", required = false) String subjectUUID,
                                      @RequestParam(value = "concepts", required = false) String concepts,
                                      Pageable pageable) {
        Page<Encounter> encounters;
        Map<Concept, String> conceptsMap = conceptService.readConceptsFromJsonObject(concepts);
        if (S.isEmpty(encounterType)) {
            encounters = encounterRepository.findByConcepts(CHSEntity.toDate(lastModifiedDateTime), CHSEntity.toDate(now), conceptsMap, pageable);
        } else if (S.isEmpty(subjectUUID)) {
            encounters = encounterRepository.findByConceptsAndEncounterType(CHSEntity.toDate(lastModifiedDateTime), CHSEntity.toDate(now), conceptsMap, encounterType, pageable);
        } else {
            encounters = encounterRepository.findByConceptsAndEncounterTypeAndSubject(CHSEntity.toDate(lastModifiedDateTime), CHSEntity.toDate(now), conceptsMap, encounterType, subjectUUID, pageable);
        }

        ArrayList<EncounterResponse> encounterResponses = new ArrayList<>();
        encounters.forEach(encounter -> {
            encounterResponses.add(EncounterResponse.fromEncounter(encounter, conceptRepository, conceptService));
        });
        return new ResponsePage(encounterResponses, encounters.getNumberOfElements(), encounters.getTotalPages(), encounters.getSize());
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

    @PostMapping(value = "/api/encounter")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    @ResponseBody
    public ResponseEntity post(@RequestBody ApiEncounterRequest request) {
        Encounter encounter = createEncounter(request.getExternalId());
        try {
            initializeIndividual(request, encounter);
            updateEncounter(encounter, request);
        } catch (ValidationException ve) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ve.getMessage());
        }
        return new ResponseEntity<>(EncounterResponse.fromEncounter(encounter, conceptRepository, conceptService), HttpStatus.OK);
    }

    private void initializeIndividual(ApiEncounterRequest request, Encounter encounter) {
        Individual individual = null;
        if (individual == null && StringUtils.hasLength(request.getSubjectId())) {
            individual = individualRepository.findByLegacyIdOrUuid(request.getSubjectId());
        }
        if (individual == null && StringUtils.hasLength(request.getSubjectExternalId())) {
            individual = individualRepository.findByLegacyId(request.getSubjectExternalId().trim());
        }
        if (individual == null) {
            throw new IllegalArgumentException(String.format("Individual not found with UUID '%s' or External ID '%s'", request.getSubjectId(), request.getSubjectExternalId()));
        }
        encounter.setIndividual(individual);
    }

    @PutMapping(value = "/api/encounter/{id}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    @ResponseBody
    public ResponseEntity put(@PathVariable String id, @RequestBody ApiEncounterRequest request) {
        Encounter encounter = encounterRepository.findByLegacyIdOrUuid(id);
        if (encounter == null && StringUtils.hasLength(request.getExternalId())) {
            encounter = encounterRepository.findByLegacyId(request.getExternalId().trim());
        }
        if (encounter == null) {
            throw new IllegalArgumentException(String.format("Encounter not found with id '%s' or External ID '%s'", id, request.getExternalId()));
        }
        try {
            updateEncounter(encounter, request);
        } catch (ValidationException ve) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ve.getMessage());
        }
        return new ResponseEntity<>(EncounterResponse.fromEncounter(encounter, conceptRepository, conceptService), HttpStatus.OK);
    }

    private void updateEncounter(Encounter encounter, ApiEncounterRequest request) throws ValidationException {
        EncounterType encounterType = encounterTypeRepository.findByName(request.getEncounterType());
        if (encounterType == null) {
            throw new IllegalArgumentException(String.format("Encounter type not found with name '%s'", request.getEncounterType()));
        }
        encounter.setLegacyId(request.getExternalId().trim());
        encounter.setEncounterType(encounterType);
        encounter.setEncounterLocation(request.getEncounterLocation());
        encounter.setCancelLocation(request.getCancelLocation());
        encounter.setEncounterDateTime(request.getEncounterDateTime());
        encounter.setEarliestVisitDateTime(request.getEarliestScheduledDate());
        encounter.setMaxVisitDateTime(request.getMaxScheduledDate());
        encounter.setCancelDateTime(request.getCancelDateTime());
        encounter.setObservations(RequestUtils.createObservations(request.getObservations(), conceptRepository));
        encounter.setCancelObservations(RequestUtils.createObservations(request.getCancelObservations(), conceptRepository));
        encounter.setVoided(request.isVoided());

        encounter.validate();
        encounterService.save(encounter);
    }

    private Encounter createEncounter(String externalId) {
        if (StringUtils.hasLength(externalId) && encounterRepository.findByLegacyId(externalId.trim()) != null) {
            throw new EntityExistsException(String.format("Entity with external id '%s' already exists", externalId));
        }
        Encounter encounter = new Encounter();
        encounter.assignUUID();
        if (StringUtils.hasLength(externalId)) {
            encounter.setLegacyId(externalId.trim());
        }
        return encounter;
    }
}
