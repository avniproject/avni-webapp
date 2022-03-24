package org.avni.web.api;

import org.avni.service.EncounterService;
import org.joda.time.DateTime;
import org.avni.dao.*;
import org.avni.domain.*;
import org.avni.service.ConceptService;
import org.avni.util.S;
import org.avni.web.request.api.ApiProgramEncounterRequest;
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
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.Map;

@RestController
public class ProgramEncounterApiController {
    private final ProgramEncounterRepository programEncounterRepository;
    private final ConceptRepository conceptRepository;
    private final ConceptService conceptService;
    private final ProgramEnrolmentRepository programEnrolmentRepository;
    private final EncounterTypeRepository encounterTypeRepository;
    private final EncounterService encounterService;

    @Autowired
    public ProgramEncounterApiController(ProgramEncounterRepository programEncounterRepository, ConceptRepository conceptRepository, ConceptService conceptService, ProgramEnrolmentRepository programEnrolmentRepository, EncounterTypeRepository encounterTypeRepository, EncounterService encounterService) {
        this.programEncounterRepository = programEncounterRepository;
        this.conceptRepository = conceptRepository;
        this.conceptService = conceptService;
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.encounterService = encounterService;
    }

    @RequestMapping(value = "/api/programEncounters", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public ResponsePage getEncounters(@RequestParam(name = "lastModifiedDateTime", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
                                      @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
                                      @RequestParam(value = "encounterType", required = false) String encounterType,
                                      @RequestParam(value = "concepts", required = false) String concepts,
                                      @RequestParam(value = "programEnrolmentId", required = false) String programEnrolmentUuid,
                                      Pageable pageable) {
        Page<ProgramEncounter> programEncounters = programEncounterRepository.search(createSearchParams(lastModifiedDateTime, now, encounterType, concepts, programEnrolmentUuid), pageable);

        ArrayList<EncounterResponse> programEncounterResponses = new ArrayList<>();
        programEncounters.forEach(programEncounter -> {
            programEncounterResponses.add(EncounterResponse.fromProgramEncounter(programEncounter, conceptRepository, conceptService));
        });
        return new ResponsePage(programEncounterResponses, programEncounters.getNumberOfElements(), programEncounters.getTotalPages(), programEncounters.getSize());
    }

    public ProgramEncounterRepository.SearchParams createSearchParams(DateTime lastModifiedDateTime,
                                                                      DateTime now,
                                                                      String encounterTypeStr,
                                                                      String concepts, String programEnrolmentUuid) {
        EncounterType encounterType = null;
        if (!S.isEmpty(encounterTypeStr)) {
            encounterType = encounterTypeRepository.findByName(encounterTypeStr);
        }
        Map<Concept, String> conceptsMap = conceptService.readConceptsFromJsonObject(concepts);
        ProgramEnrolment programEnrolment = null;
        if (!S.isEmpty(programEnrolmentUuid)) {
            programEnrolment = programEnrolmentRepository.findByUuid(programEnrolmentUuid);
        }

        return new ProgramEncounterRepository.SearchParams(CHSEntity.toDate(lastModifiedDateTime), CHSEntity.toDate(now), conceptsMap, encounterType, programEnrolment);
    }

    @GetMapping(value = "/api/programEncounter/{id}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public ResponseEntity<EncounterResponse> get(@PathVariable("id") String uuid) {
        ProgramEncounter programEncounter = programEncounterRepository.findByUuid(uuid);
        if (programEncounter == null)
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(EncounterResponse.fromProgramEncounter(programEncounter, conceptRepository, conceptService), HttpStatus.OK);
    }

    @PostMapping(value = "/api/programEncounter")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    @ResponseBody
    public ResponseEntity post(@RequestBody ApiProgramEncounterRequest request) {
        ProgramEncounter encounter = new ProgramEncounter();
        encounter.assignUUID();
        try {
            updateEncounter(encounter, request);
        } catch (ValidationException ve) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ve.getMessage());
        }
        return new ResponseEntity<>(EncounterResponse.fromProgramEncounter(encounter, conceptRepository, conceptService), HttpStatus.OK);
    }

    @PutMapping(value = "/api/programEncounter/{id}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    @ResponseBody
    public ResponseEntity put(@PathVariable String id, @RequestBody ApiProgramEncounterRequest request) {
        ProgramEncounter encounter = programEncounterRepository.findByUuid(id);
        if (encounter == null) {
            throw new IllegalArgumentException(String.format("Encounter not found with id '%s'", id));
        }
        try {
            updateEncounter(encounter, request);
        } catch (ValidationException ve) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ve.getMessage());
        }
        return new ResponseEntity<>(EncounterResponse.fromProgramEncounter(encounter, conceptRepository, conceptService), HttpStatus.OK);
    }

    private ProgramEncounter updateEncounter(ProgramEncounter encounter, ApiProgramEncounterRequest request) throws ValidationException {
        ProgramEnrolment programEnrolment = programEnrolmentRepository.findByUuid(request.getEnrolmentId());
        if (programEnrolment == null) {
            throw new IllegalArgumentException(String.format("Program Enrolment not found with UUID '%s'", request.getEnrolmentId()));
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
        encounter.setProgramEnrolment(programEnrolment);
        encounter.setObservations(RequestUtils.createObservations(request.getObservations(), conceptRepository));
        encounter.setCancelObservations(RequestUtils.createObservations(request.getCancelObservations(), conceptRepository));
        encounter.setVoided(request.isVoided());

        encounter.validate();
        encounterService.addSyncAttributes(encounter, programEnrolment.getIndividual());
        return programEncounterRepository.save(encounter);
    }
}
