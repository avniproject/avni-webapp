package org.avni.web;

import org.avni.application.FormMapping;
import org.avni.application.FormType;
import org.avni.dao.EncounterTypeRepository;
import org.avni.dao.ProgramEncounterRepository;
import org.avni.dao.SyncParameters;
import org.avni.domain.CHSEntity;
import org.avni.domain.EncounterType;
import org.avni.domain.ProgramEncounter;
import org.avni.service.FormMappingService;
import org.avni.service.ProgramEncounterService;
import org.avni.service.ScopeBasedSyncService;
import org.avni.service.UserService;
import org.avni.web.request.ProgramEncounterRequest;
import org.avni.web.request.ProgramEncountersContract;
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
public class ProgramEncounterController implements RestControllerResourceProcessor<ProgramEncounter> {
    private static org.slf4j.Logger logger = LoggerFactory.getLogger(IndividualController.class);
    private EncounterTypeRepository encounterTypeRepository;
    private ProgramEncounterRepository programEncounterRepository;
    private UserService userService;
    private final ProgramEncounterService programEncounterService;
    private ScopeBasedSyncService<ProgramEncounter> scopeBasedSyncService;
    private FormMappingService formMappingService;

    @Autowired
    public ProgramEncounterController(EncounterTypeRepository encounterTypeRepository, ProgramEncounterRepository programEncounterRepository, UserService userService, ProgramEncounterService programEncounterService, ScopeBasedSyncService<ProgramEncounter> scopeBasedSyncService, FormMappingService formMappingService) {
        this.encounterTypeRepository = encounterTypeRepository;
        this.programEncounterRepository = programEncounterRepository;
        this.userService = userService;
        this.programEncounterService = programEncounterService;
        this.scopeBasedSyncService = scopeBasedSyncService;
        this.formMappingService = formMappingService;
    }

    @GetMapping(value = "/web/programEncounter/{uuid}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public ResponseEntity<ProgramEncountersContract> getProgramEncounterByUuid(@PathVariable("uuid") String uuid) {
        ProgramEncountersContract programEncountersContract = programEncounterService.getProgramEncounterByUuid(uuid);
        if (programEncountersContract == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(programEncountersContract);
    }

    @RequestMapping(value = "/programEncounters", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public void save(@RequestBody ProgramEncounterRequest request) {
        programEncounterService.saveProgramEncounter(request);
        if (request.getVisitSchedules() != null && request.getVisitSchedules().size() > 0) {
            programEncounterService.saveVisitSchedules(request.getProgramEnrolmentUUID(), request.getVisitSchedules(), request.getUuid());
        }
    }

    @RequestMapping(value = "/programEncounter/search/byIndividualsOfCatchmentAndLastModified", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Deprecated()
    public PagedResources<Resource<ProgramEncounter>> getByIndividualsOfCatchmentAndLastModified(
            @RequestParam("catchmentId") long catchmentId,
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(programEncounterRepository.findByProgramEnrolmentIndividualAddressLevelVirtualCatchmentsIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(catchmentId, CHSEntity.toDate(lastModifiedDateTime), CHSEntity.toDate(now), pageable));
    }

    @RequestMapping(value = "/programEncounter/search/lastModified", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<ProgramEncounter>> getByLastModified(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(programEncounterRepository.findByLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(lastModifiedDateTime, now, pageable));
    }

    @RequestMapping(value = "/programEncounter", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<ProgramEncounter>> getProgramEncountersByOperatingIndividualScope(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            @RequestParam(value = "programEncounterTypeUuid", required = false) String encounterTypeUuid,
            Pageable pageable) {
        if (encounterTypeUuid.isEmpty()) return wrap(new PageImpl<>(Collections.emptyList()));
        EncounterType encounterType = encounterTypeRepository.findByUuid(encounterTypeUuid);
        if (encounterType == null) return wrap(new PageImpl<>(Collections.emptyList()));

        FormMapping formMapping = formMappingService.find(encounterType, FormType.ProgramEncounter);
        if (formMapping == null) {
            logger.warn(String.format("No form mapping found for program encounter %s", encounterType.getName()));
            return wrap(new PageImpl<>(Collections.emptyList()));
        }

        return wrap(scopeBasedSyncService.getSyncResultsBySubjectTypeRegistrationLocation(programEncounterRepository, userService.getCurrentUser(), lastModifiedDateTime, now, encounterType.getId(), pageable, formMapping.getSubjectType(), SyncParameters.SyncEntityName.ProgramEncounter));
    }

    @DeleteMapping("/web/programEncounter/{uuid}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
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
}
