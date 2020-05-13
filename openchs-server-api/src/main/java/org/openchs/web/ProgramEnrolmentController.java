package org.openchs.web;

import org.joda.time.DateTime;
import org.openchs.dao.*;
import org.openchs.domain.*;
import org.openchs.geo.Point;
import org.openchs.projection.ProgramEnrolmentProjection;
import org.openchs.service.*;
import org.openchs.util.S;
import org.openchs.web.request.EnrolmentContract;
import org.openchs.web.request.PointRequest;
import org.openchs.web.request.ProgramEncountersContract;
import org.openchs.web.request.ProgramEnrolmentRequest;
import org.openchs.web.response.ProgramEnrolmentResponse;
import org.openchs.web.response.ResponsePage;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.data.jpa.domain.Specifications.where;

@RestController
public class ProgramEnrolmentController extends AbstractController<ProgramEnrolment> implements RestControllerResourceProcessor<ProgramEnrolment>, OperatingIndividualScopeAwareController<ProgramEnrolment>, OperatingIndividualScopeAwareFilterController<ProgramEnrolment> {
    private static org.slf4j.Logger logger = LoggerFactory.getLogger(IndividualController.class);
    private final ProgramRepository programRepository;
    private final IndividualRepository individualRepository;
    private final ProgramOutcomeRepository programOutcomeRepository;
    private final ProgramEnrolmentRepository programEnrolmentRepository;
    private final ObservationService observationService;
    private final UserService userService;
    private final ProjectionFactory projectionFactory;
    private final ConceptRepository conceptRepository;
    private final ConceptService conceptService;
    private final ProgramEnrolmentService programEnrolmentService;
    private final ProgramEncounterService programEncounterService;

    @Autowired
    public ProgramEnrolmentController(ProgramRepository programRepository, IndividualRepository individualRepository, ProgramOutcomeRepository programOutcomeRepository, ProgramEnrolmentRepository programEnrolmentRepository, ObservationService observationService, UserService userService, ProjectionFactory projectionFactory, ConceptRepository conceptRepository, ConceptService conceptService,ProgramEnrolmentService programEnrolmentService, ProgramEncounterService programEncounterService) {
        this.programRepository = programRepository;
        this.individualRepository = individualRepository;
        this.programOutcomeRepository = programOutcomeRepository;
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.observationService = observationService;
        this.userService = userService;
        this.projectionFactory = projectionFactory;
        this.conceptRepository = conceptRepository;
        this.conceptService = conceptService;
        this.programEnrolmentService = programEnrolmentService;
        this.programEncounterService = programEncounterService;
    }

    @RequestMapping(value = "/api/enrolments", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public ResponsePage getEnrolments(@RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
                                      @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
                                      @RequestParam(value = "program", required = false) String program,
                                      Pageable pageable) {
        Page<ProgramEnrolment> programEnrolments;
        if (S.isEmpty(program)) {
            programEnrolments = programEnrolmentRepository.findByAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(lastModifiedDateTime, now, pageable);
        } else {
            programEnrolments = programEnrolmentRepository.findByAuditLastModifiedDateTimeIsBetweenAndProgramNameOrderByAuditLastModifiedDateTimeAscIdAsc(lastModifiedDateTime, now, program, pageable);
        }
        ArrayList<ProgramEnrolmentResponse> programEnrolmentResponses = new ArrayList<>();
        programEnrolments.forEach(programEnrolment -> {
            programEnrolmentResponses.add(ProgramEnrolmentResponse.fromProgramEnrolment(programEnrolment, conceptRepository, conceptService));
        });
        return new ResponsePage(programEnrolmentResponses, programEnrolments.getNumberOfElements(), programEnrolments.getTotalPages(), programEnrolments.getSize());
    }

    @GetMapping(value = "/api/enrolment/{id}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public ResponseEntity<ProgramEnrolmentResponse> get(@PathVariable("id") String uuid) {
        ProgramEnrolment programEnrolment = programEnrolmentRepository.findByUuid(uuid);
        if (programEnrolment == null)
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(ProgramEnrolmentResponse.fromProgramEnrolment(programEnrolment, conceptRepository, conceptService), HttpStatus.OK);
    }

    @RequestMapping(value = "/programEnrolments", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    @Transactional
    public void save(@RequestBody ProgramEnrolmentRequest request) {
        if(request.getVisitSchedules() != null && request.getVisitSchedules().size() > 0) {
            programEncounterService.saveVisitSchedules(request.getUuid(),request.getVisitSchedules());
        }
        programEnrolmentService.programEnrolmentSave(request);
    }



    @GetMapping(value = {"/programEnrolment", /* Deprecated -> */ "/programEnrolment/search/lastModified", "/programEnrolment/search/byIndividualsOfCatchmentAndLastModified"})
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public PagedResources<Resource<ProgramEnrolment>> getProgramEnrolmentsByOperatingIndividualScope(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            @RequestParam(value = "programUuid", required = false) String programUuid,
            Pageable pageable) {
        if (programUuid == null) {
            return wrap(getCHSEntitiesForUserByLastModifiedDateTime(userService.getCurrentUser(), lastModifiedDateTime, now, pageable));
        } else {
            return programUuid.isEmpty() ? wrap(new PageImpl<>(Collections.emptyList())) :
                    wrap(getCHSEntitiesForUserByLastModifiedDateTimeAndFilterByType(userService.getCurrentUser(), lastModifiedDateTime, now, programUuid, pageable));
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

    @GetMapping("/web/programEnrolment/{id}/completed")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public Page<ProgramEncountersContract> getAllCompletedEncounters(
            @PathVariable Long id,
            @RequestParam(value = "encounterDateTime", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime encounterDateTime,
            @RequestParam(value = "earliestVisitDateTime", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime earliestVisitDateTime,
            @RequestParam(value = "encounterTypeIds",required = false) String encounterTypeIds,
            Pageable pageable) {
        return programEnrolmentService.getAllCompletedEncounters(id,encounterTypeIds,encounterDateTime,earliestVisitDateTime,pageable);
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

    @Override
    public OperatingIndividualScopeAwareRepository<ProgramEnrolment> resourceRepository() {
        return programEnrolmentRepository;
    }

    @Override
    public OperatingIndividualScopeAwareRepositoryWithTypeFilter<ProgramEnrolment> repository() {
        return programEnrolmentRepository;
    }
}
