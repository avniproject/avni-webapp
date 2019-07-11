package org.openchs.web;

import org.joda.time.DateTime;
import org.openchs.dao.*;
import org.openchs.domain.Individual;
import org.openchs.domain.Program;
import org.openchs.domain.ProgramEnrolment;
import org.openchs.domain.ProgramOutcome;
import org.openchs.geo.Point;
import org.openchs.projection.ProgramEnrolmentProjection;
import org.openchs.service.ObservationService;
import org.openchs.service.UserService;
import org.openchs.web.request.PointRequest;
import org.openchs.web.request.ProgramEnrolmentRequest;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;

@RestController
public class ProgramEnrolmentController extends AbstractController<ProgramEnrolment> implements RestControllerResourceProcessor<ProgramEnrolment>, OperatingIndividualScopeAwareController<ProgramEnrolment> {
    private static org.slf4j.Logger logger = LoggerFactory.getLogger(IndividualController.class);
    private final ProgramRepository programRepository;
    private final IndividualRepository individualRepository;
    private final ProgramOutcomeRepository programOutcomeRepository;
    private final ProgramEnrolmentRepository programEnrolmentRepository;
    private final ObservationService observationService;
    private final UserService userService;
    private final ProjectionFactory projectionFactory;

    @Autowired
    public ProgramEnrolmentController(ProgramRepository programRepository, IndividualRepository individualRepository, ProgramOutcomeRepository programOutcomeRepository, ProgramEnrolmentRepository programEnrolmentRepository, ObservationService observationService, UserService userService, ProjectionFactory projectionFactory) {
        this.programRepository = programRepository;
        this.individualRepository = individualRepository;
        this.programOutcomeRepository = programOutcomeRepository;
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.observationService = observationService;
        this.userService = userService;
        this.projectionFactory = projectionFactory;
    }

    @RequestMapping(value = "/programEnrolments", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    public void save(@RequestBody ProgramEnrolmentRequest request) {
        logger.info(String.format("Saving programEnrolment with uuid %s", request.getUuid()));
        Program program;
        if (request.getProgramUUID() == null) {
            program = programRepository.findByName(request.getProgram());
        } else {
            program = programRepository.findByUuid(request.getProgramUUID());
        }
        ProgramOutcome programOutcome = programOutcomeRepository.findByUuid(request.getProgramOutcomeUUID());

        ProgramEnrolment programEnrolment = newOrExistingEntity(programEnrolmentRepository, request, new ProgramEnrolment());
        programEnrolment.setProgram(program);
        programEnrolment.setProgramOutcome(programOutcome);
        programEnrolment.setEnrolmentDateTime(request.getEnrolmentDateTime());
        programEnrolment.setProgramExitDateTime(request.getProgramExitDateTime());
        PointRequest enrolmentLocation = request.getEnrolmentLocation();
        if (enrolmentLocation != null)
            programEnrolment.setEnrolmentLocation(new Point(enrolmentLocation.getX(), enrolmentLocation.getY()));
        PointRequest exitLocation = request.getExitLocation();
        if (exitLocation != null)
            programEnrolment.setExitLocation(new Point(exitLocation.getX(), exitLocation.getY()));
        programEnrolment.setObservations(observationService.createObservations(request.getObservations()));
        programEnrolment.setProgramExitObservations(observationService.createObservations(request.getProgramExitObservations()));

        if (programEnrolment.isNew()) {
            Individual individual = individualRepository.findByUuid(request.getIndividualUUID());
            programEnrolment.setIndividual(individual);
            individual.addEnrolment(programEnrolment);
            individualRepository.save(individual);
        } else {
            programEnrolmentRepository.save(programEnrolment);
        }
        logger.info(String.format("Saved programEnrolment with uuid %s", request.getUuid()));
    }

    @GetMapping(value = {"/programEnrolment", /* Deprecated -> */ "/programEnrolment/search/lastModified", "/programEnrolment/search/byIndividualsOfCatchmentAndLastModified"})
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<ProgramEnrolment>> getProgramEnrolmentsByOperatingIndividualScope(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(getCHSEntitiesForUserByLastModifiedDateTime(userService.getCurrentUser(), lastModifiedDateTime, now, pageable));
    }

    @GetMapping("/web/programEnrolment/{uuid}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public ProgramEnrolmentProjection getOneForWeb(@PathVariable String uuid) {
        return projectionFactory.createProjection(ProgramEnrolmentProjection.class, programEnrolmentRepository.findByUuid(uuid));
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
}