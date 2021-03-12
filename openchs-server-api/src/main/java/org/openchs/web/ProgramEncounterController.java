package org.openchs.web;

import org.joda.time.DateTime;
import org.openchs.dao.*;
import org.openchs.domain.EncounterType;
import org.openchs.domain.ProgramEncounter;
import org.openchs.domain.ProgramEnrolment;
import org.openchs.service.ConceptService;
import org.openchs.service.ProgramEncounterService;
import org.openchs.service.UserService;
import org.openchs.util.S;
import org.openchs.web.request.ProgramEncounterRequest;
import org.openchs.web.request.ProgramEncountersContract;
import org.openchs.web.request.api.ApiProgramEncounterRequest;
import org.openchs.web.request.api.RequestUtils;
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
import java.util.ArrayList;
import java.util.Collections;

@RestController
public class ProgramEncounterController implements RestControllerResourceProcessor<ProgramEncounter>, OperatingIndividualScopeAwareController<ProgramEncounter>, OperatingIndividualScopeAwareFilterController<ProgramEncounter> {
    private static org.slf4j.Logger logger = LoggerFactory.getLogger(IndividualController.class);
    private EncounterTypeRepository encounterTypeRepository;
    private ProgramEncounterRepository programEncounterRepository;
    private ProgramEnrolmentRepository programEnrolmentRepository;
    private UserService userService;
    private final ConceptRepository conceptRepository;
    private final ConceptService conceptService;
    private final ProgramEncounterService programEncounterService;

    @Autowired
    public ProgramEncounterController(EncounterTypeRepository encounterTypeRepository, ProgramEncounterRepository programEncounterRepository, ProgramEnrolmentRepository programEnrolmentRepository, UserService userService, ConceptRepository conceptRepository, ConceptService conceptService, ProgramEncounterService programEncounterService) {
        this.encounterTypeRepository = encounterTypeRepository;
        this.programEncounterRepository = programEncounterRepository;
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.userService = userService;
        this.conceptRepository = conceptRepository;
        this.conceptService = conceptService;
        this.programEncounterService = programEncounterService;
    }

    @RequestMapping(value = "/api/programEncounters", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public ResponsePage getEncounters(@RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
                                      @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
                                      @RequestParam(value = "encounterType", required = false) String encounterType,
                                      Pageable pageable) {
        Page<ProgramEncounter> programEncounters;
        if (S.isEmpty(encounterType)) {
            programEncounters = programEncounterRepository.findByAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(lastModifiedDateTime, now, pageable);
        } else {
            programEncounters = programEncounterRepository.findByAuditLastModifiedDateTimeIsBetweenAndEncounterTypeNameOrderByAuditLastModifiedDateTimeAscIdAsc(lastModifiedDateTime, now, encounterType, pageable);
        }

        ArrayList<EncounterResponse> programEncounterResponses = new ArrayList<>();
        programEncounters.forEach(programEncounter -> {
            programEncounterResponses.add(EncounterResponse.fromProgramEncounter(programEncounter, conceptRepository, conceptService));
        });
        return new ResponsePage(programEncounterResponses, programEncounters.getNumberOfElements(), programEncounters.getTotalPages(), programEncounters.getSize());
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

    @GetMapping(value = "/web/programEncounter/{uuid}")
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    @ResponseBody
    public ResponseEntity<ProgramEncountersContract> getProgramEncounterByUuid(@PathVariable("uuid") String uuid) {
        ProgramEncountersContract programEncountersContract = programEncounterService.getProgramEncounterByUuid(uuid);
        if (programEncountersContract == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(programEncountersContract);
    }

    @RequestMapping(value = "/programEncounters", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public void save(@RequestBody ProgramEncounterRequest request) {
        programEncounterService.saveProgramEncounter(request);
        if(request.getVisitSchedules() != null && request.getVisitSchedules().size() > 0) {
            programEncounterService.saveVisitSchedules(request.getProgramEnrolmentUUID(),request.getVisitSchedules(), request.getUuid());
        }
    }

    @RequestMapping(value = "/programEncounter/search/byIndividualsOfCatchmentAndLastModified", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    @Deprecated()
    public PagedResources<Resource<ProgramEncounter>> getByIndividualsOfCatchmentAndLastModified(
            @RequestParam("catchmentId") long catchmentId,
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(programEncounterRepository.findByProgramEnrolmentIndividualAddressLevelVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(catchmentId, lastModifiedDateTime, now, pageable));
    }

    @RequestMapping(value = "/programEncounter/search/lastModified", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public PagedResources<Resource<ProgramEncounter>> getByLastModified(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(programEncounterRepository.findByAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(lastModifiedDateTime, now, pageable));
    }

    @RequestMapping(value = "/programEncounter", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public PagedResources<Resource<ProgramEncounter>> getProgramEncountersByOperatingIndividualScope(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            @RequestParam(value = "programEncounterTypeUuid", required = false) String encounterTypeUuid,
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

    @PostMapping(value = "/api/programEncounter")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    @ResponseBody
    public ResponseEntity<EncounterResponse> post(@RequestBody ApiProgramEncounterRequest request) {
        ProgramEncounter encounter = new ProgramEncounter();
        encounter.assignUUID();
        updateEncounter(encounter, request);
        return new ResponseEntity<>(EncounterResponse.fromProgramEncounter(encounter, conceptRepository, conceptService), HttpStatus.OK);
    }

    @PutMapping(value = "/api/programEncounter/{id}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    @ResponseBody
    public ResponseEntity<EncounterResponse> put(@PathVariable String id, @RequestBody ApiProgramEncounterRequest request) {
        ProgramEncounter encounter = programEncounterRepository.findByUuid(id);
        if (encounter == null) {
            throw new IllegalArgumentException(String.format("Encounter not found with id '%s'", id));
        }
        updateEncounter(encounter, request);
        return new ResponseEntity<>(EncounterResponse.fromProgramEncounter(encounter, conceptRepository, conceptService), HttpStatus.OK);
    }

    private ProgramEncounter updateEncounter(ProgramEncounter encounter, ApiProgramEncounterRequest request) {
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

        return programEncounterRepository.save(encounter);
    }

    @DeleteMapping("/web/programEncounter/{uuid}")
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    @ResponseBody
    @Transactional
    public ResponseEntity<?> voidSubject(@PathVariable String uuid) {
        ProgramEncounter programEncounter = programEncounterRepository.findByUuid(uuid);
        if (programEncounter == null) {
            return ResponseEntity.notFound().build();
        }
        programEncounter.setVoided(true);
        ProgramEncounter voidedEncounter = programEncounterRepository.save(programEncounter);
        return ResponseEntity.ok(voidedEncounter);
    }

    @Override
    public Resource<ProgramEncounter> process(Resource<ProgramEncounter> resource) {
        ProgramEncounter programEncounter = resource.getContent();
        resource.removeLinks();
        resource.add(new Link(programEncounter.getEncounterType().getUuid(), "encounterTypeUUID"));
        resource.add(new Link(programEncounter.getProgramEnrolment().getUuid(), "programEnrolmentUUID"));
        return resource;
    }

    @Override
    public OperatingIndividualScopeAwareRepository<ProgramEncounter> resourceRepository() {
        return programEncounterRepository;
    }

    @Override
    public OperatingIndividualScopeAwareRepositoryWithTypeFilter<ProgramEncounter> repository() {
        return programEncounterRepository;
    }
}
