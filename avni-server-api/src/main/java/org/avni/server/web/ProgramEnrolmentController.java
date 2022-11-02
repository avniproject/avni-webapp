package org.avni.server.web;

import org.avni.server.application.FormMapping;
import org.avni.server.application.FormType;
import org.avni.server.dao.ProgramEnrolmentRepository;
import org.avni.server.dao.ProgramRepository;
import org.avni.server.dao.SyncParameters;
import org.avni.server.dao.application.FormMappingRepository;
import org.avni.server.service.FormMappingService;
import org.avni.server.service.ProgramEnrolmentService;
import org.avni.server.service.ScopeBasedSyncService;
import org.avni.server.service.UserService;
import org.avni.server.web.response.AvniEntityResponse;
import org.joda.time.DateTime;
import org.avni.server.domain.Program;
import org.avni.server.domain.ProgramEnrolment;
import org.avni.server.projection.ProgramEnrolmentProjection;
import org.avni.server.web.request.EnrolmentContract;
import org.avni.server.web.request.ProgramEncountersContract;
import org.avni.server.web.request.ProgramEnrolmentRequest;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.Collections;

@RestController
public class ProgramEnrolmentController extends AbstractController<ProgramEnrolment> implements RestControllerResourceProcessor<ProgramEnrolment> {
    private static org.slf4j.Logger logger = LoggerFactory.getLogger(IndividualController.class);
    private final ProgramEnrolmentRepository programEnrolmentRepository;
    private final UserService userService;
    private final ProjectionFactory projectionFactory;
    private final ProgramEnrolmentService programEnrolmentService;
    private final ProgramRepository programRepository;
    private ScopeBasedSyncService<ProgramEnrolment> scopeBasedSyncService;
    private FormMappingService formMappingService;

    @Autowired
    public ProgramEnrolmentController(ProgramRepository programRepository, ProgramEnrolmentRepository programEnrolmentRepository, UserService userService, ProjectionFactory projectionFactory, ProgramEnrolmentService programEnrolmentService, ScopeBasedSyncService<ProgramEnrolment> scopeBasedSyncService, FormMappingRepository formMappingRepository, FormMappingService formMappingService) {
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.userService = userService;
        this.projectionFactory = projectionFactory;
        this.programEnrolmentService = programEnrolmentService;
        this.programRepository = programRepository;
        this.scopeBasedSyncService = scopeBasedSyncService;
        this.formMappingService = formMappingService;
    }

    @RequestMapping(value = "/programEnrolments", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    public AvniEntityResponse save(@RequestBody ProgramEnrolmentRequest request) {
        ProgramEnrolment programEnrolment = programEnrolmentService.programEnrolmentSave(request);
        return new AvniEntityResponse(programEnrolmentRepository.findByUuid(request.getUuid()));
    }

    @GetMapping(value = {"/programEnrolment", /* Deprecated -> */ "/programEnrolment/search/lastModified", "/programEnrolment/search/byIndividualsOfCatchmentAndLastModified"})
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<ProgramEnrolment>> getProgramEnrolmentsByOperatingIndividualScope(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            @RequestParam(value = "programUuid", required = false) String programUuid,
            Pageable pageable) throws Exception {
        if (programUuid.isEmpty()) return wrap(new PageImpl<>(Collections.emptyList()));
        else {
            Program program = programRepository.findByUuid(programUuid);
            if (program == null) return wrap(new PageImpl<>(Collections.emptyList()));
            FormMapping formMapping = formMappingService.find(program, FormType.ProgramEnrolment);
            if (formMapping == null)
                throw new Exception(String.format("No form mapping found for program %s", program.getName()));
            return wrap(scopeBasedSyncService.getSyncResultsBySubjectTypeRegistrationLocation(programEnrolmentRepository, userService.getCurrentUser(), lastModifiedDateTime, now, program.getId(), pageable, formMapping.getSubjectType(), SyncParameters.SyncEntityName.Enrolment));
        }
    }

    @GetMapping("/web/programEnrolment/{uuid}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public ProgramEnrolmentProjection getOneForWeb(@PathVariable String uuid) {
        return projectionFactory.createProjection(ProgramEnrolmentProjection.class, programEnrolmentRepository.findByUuid(uuid));
    }

    @GetMapping("/web/programEnrolments/{uuid}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public ResponseEntity<EnrolmentContract> getProgramEnrolmentByUuid(@PathVariable String uuid) {
        EnrolmentContract enrolmentContract = programEnrolmentService.constructEnrolments(uuid);
        if (enrolmentContract == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(enrolmentContract);
    }

    @GetMapping("/web/programEnrolment/{uuid}/completed")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public Page<ProgramEncountersContract> getAllCompletedEncounters(
            @PathVariable String uuid,
            @RequestParam(value = "encounterDateTime", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime encounterDateTime,
            @RequestParam(value = "earliestVisitDateTime", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime earliestVisitDateTime,
            @RequestParam(value = "encounterTypeUuids", required = false) String encounterTypeUuids,
            Pageable pageable) {
        return programEnrolmentService.getAllCompletedEncounters(uuid, encounterTypeUuids, encounterDateTime, earliestVisitDateTime, pageable);
    }

    @DeleteMapping("/web/programEnrolment/{uuid}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    @Transactional
    public ResponseEntity<?> voidProgramEnrolment(@PathVariable String uuid) {
        ProgramEnrolment programEnrolment = programEnrolmentRepository.findByUuid(uuid);
        if (programEnrolment == null) {
            return ResponseEntity.notFound().build();
        }
        ProgramEnrolment voidedEnrolment = programEnrolmentService.voidEnrolment(programEnrolment);
        return ResponseEntity.ok(voidedEnrolment);
    }

    @Override
    public Resource<ProgramEnrolment> process(Resource<ProgramEnrolment> resource) {
        ProgramEnrolment programEnrolment = resource.getContent();
        resource.removeLinks();
        resource.add(new Link(programEnrolment.getProgram().getUuid(), "programUUID"));
        resource.add(new Link(programEnrolment.getIndividual().getUuid(), "individualUUID"));
        if (programEnrolment.getProgramOutcome() != null) {
            resource.add(new Link(programEnrolment.getProgramOutcome().getUuid(), "programOutcomeUUID"));
        }
        return resource;
    }

}
