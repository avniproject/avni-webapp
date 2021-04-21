package org.openchs.web.api;

import org.joda.time.DateTime;
import org.openchs.dao.*;
import org.openchs.domain.*;
import org.openchs.service.ConceptService;
import org.openchs.util.S;
import org.openchs.web.request.api.ApiEncounterRequest;
import org.openchs.web.request.api.RequestUtils;
import org.openchs.web.response.EncounterResponse;
import org.openchs.web.response.ResponsePage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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

    @Autowired
    public GeneralEncounterApiController(ConceptService conceptService, EncounterRepository encounterRepository, ConceptRepository conceptRepository, IndividualRepository individualRepository, EncounterTypeRepository encounterTypeRepository) {
        this.conceptService = conceptService;
        this.encounterRepository = encounterRepository;
        this.conceptRepository = conceptRepository;
        this.individualRepository = individualRepository;
        this.encounterTypeRepository = encounterTypeRepository;
    }

    @RequestMapping(value = "/api/encounters", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public ResponsePage getEncounters(@RequestParam(value = "lastModifiedDateTime", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
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
        Encounter encounter = new Encounter();
        encounter.assignUUID();
        try {
            updateEncounter(encounter, request);
        } catch (ValidationException ve) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ve.getMessage());
        }
        return new ResponseEntity<>(EncounterResponse.fromEncounter(encounter, conceptRepository, conceptService), HttpStatus.OK);
    }

    @PutMapping(value = "/api/encounter/{id}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    @ResponseBody
    public ResponseEntity put(@PathVariable String id, @RequestBody ApiEncounterRequest request) {
        Encounter encounter = encounterRepository.findByUuid(id);
        if (encounter == null) {
            throw new IllegalArgumentException(String.format("Encounter not found with id '%s'", id));
        }
        try {
            updateEncounter(encounter, request);
        } catch (ValidationException ve) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ve.getMessage());
        }
        return new ResponseEntity<>(EncounterResponse.fromEncounter(encounter, conceptRepository, conceptService), HttpStatus.OK);
    }

    private void updateEncounter(Encounter encounter, ApiEncounterRequest request) throws ValidationException {
        Individual individual = individualRepository.findByUuid(request.getSubjectId());
        if (individual == null) {
            throw new IllegalArgumentException(String.format("Individual not found with UUID '%s'", request.getSubjectId()));
        }

        EncounterType encounterType = encounterTypeRepository.findByName(request.getEncounterType());
        if (encounterType == null) {
            throw new IllegalArgumentException(String.format("Encounter type not found with name '%s'", request.getEncounterType()));
        }

        encounter.setEncounterType(encounterType);
        encounter.setEncounterLocation(request.getEncounterLocation());
        encounter.setCancelLocation(request.getCancelLocation());
        encounter.setEncounterDateTime(request.getEncounterDateTime());
        encounter.setEarliestVisitDateTime(request.getEarliestScheduledDate());
        encounter.setMaxVisitDateTime(request.getMaxScheduledDate());
        encounter.setCancelDateTime(request.getCancelDateTime());
        encounter.setIndividual(individual);
        encounter.setObservations(RequestUtils.createObservations(request.getObservations(), conceptRepository));
        encounter.setCancelObservations(RequestUtils.createObservations(request.getCancelObservations(), conceptRepository));
        encounter.setVoided(request.isVoided());

        encounter.validate();

        encounterRepository.save(encounter);
    }
}