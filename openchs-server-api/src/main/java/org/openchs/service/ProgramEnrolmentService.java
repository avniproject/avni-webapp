package org.openchs.service;

import org.joda.time.DateTime;
import org.openchs.common.EntityHelper;
import org.openchs.dao.*;
import org.openchs.domain.*;
import org.openchs.geo.Point;
import org.openchs.web.AbstractController;
import org.openchs.web.IndividualController;
import org.openchs.web.request.*;
import org.openchs.web.request.rules.RulesContractWrapper.Decisions;
import org.openchs.web.request.rules.RulesContractWrapper.VisitSchedule;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.springframework.data.jpa.domain.Specifications.where;

@Service
public class ProgramEnrolmentService {
    private static org.slf4j.Logger logger = LoggerFactory.getLogger(ProgramEnrolmentService.class);

    private ProgramEnrolmentRepository programEnrolmentRepository;
    private ProgramEncounterService programEncounterService;
    private ProgramEncounterRepository programEncounterRepository;
    private ProgramRepository programRepository;
    private ObservationService observationService;
    private IndividualRepository individualRepository;
    private ProgramOutcomeRepository programOutcomeRepository;

    @Autowired
    public ProgramEnrolmentService(ProgramEnrolmentRepository programEnrolmentRepository,ProgramEncounterService programEncounterService,ProgramEncounterRepository programEncounterRepository,ProgramRepository programRepository,ObservationService observationService,IndividualRepository individualRepository,ProgramOutcomeRepository programOutcomeRepository) {
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.programEncounterService = programEncounterService;
        this.programEncounterRepository = programEncounterRepository;
        this.programRepository = programRepository;
        this.observationService = observationService;
        this.individualRepository = individualRepository;
        this.programOutcomeRepository = programOutcomeRepository;
    }

    @Transactional
    public ProgramEncounter matchingEncounter(String programEnrolmentUUID, String encounterTypeName, DateTime encounterDateTime) {
        ProgramEnrolment programEnrolment = programEnrolmentRepository.findByUuid(programEnrolmentUUID);
        if (programEnrolment == null) {
            throw new IllegalArgumentException(String.format("ProgramEnrolment not found with UUID '%s'", programEnrolmentUUID));
        }
        return programEnrolment.getProgramEncounters().stream()
                .filter(programEncounter ->
                        programEncounter.getEncounterType().getName().equals(encounterTypeName)
                                && programEncounter.dateFallsWithIn(encounterDateTime))
                .findAny()
                .orElse(null);
    }

    public EnrolmentContract constructEnrolments(String uuid) {
        ProgramEnrolment programEnrolment = programEnrolmentRepository.findByUuid(uuid);
        EnrolmentContract enrolmentContract = new EnrolmentContract();
        enrolmentContract.setUuid(programEnrolment.getUuid());
        enrolmentContract.setProgramUuid(programEnrolment.getProgram().getUuid());
        enrolmentContract.setOperationalProgramName(programEnrolment.getProgram().getOperationalProgramName());
        enrolmentContract.setEnrolmentDateTime(programEnrolment.getEnrolmentDateTime());
        enrolmentContract.setProgramExitDateTime(programEnrolment.getProgramExitDateTime());
        enrolmentContract.setSubjectUuid(programEnrolment.getIndividual().getUuid());
        enrolmentContract.setVoided(programEnrolment.isVoided());
        List<ObservationContract> observationContractsList = observationService.constructObservations(programEnrolment.getObservations());
        enrolmentContract.setObservations(observationContractsList);
        if (programEnrolment.getProgramExitObservations() != null) {
            enrolmentContract.setExitObservations(observationService.constructObservations(programEnrolment.getProgramExitObservations()));
        }
        return enrolmentContract;
    }

    public Page<ProgramEncountersContract> getAllCompletedEncounters(String uuid, String encounterTypeUuids, DateTime encounterDateTime, DateTime earliestVisitDateTime, Pageable pageable){
        Page<ProgramEncountersContract> programEncountersContract = null;
        List<String> encounterTypeIdList = new ArrayList<>();
        if(encounterTypeUuids != null) {
            encounterTypeIdList = Arrays.asList(encounterTypeUuids.split(","));
        }
        ProgramEnrolment programEnrolment = programEnrolmentRepository.findByUuid(uuid);
        Specification<ProgramEncounter> completedEncounterSpecification = Specification.where(programEncounterRepository.withNotNullEncounterDateTime())
                .or(programEncounterRepository.withNotNullCancelDateTime());
        programEncountersContract = programEncounterRepository.findAll(
                where(programEncounterRepository.withProgramEncounterId(programEnrolment.getId()))
                        .and(programEncounterRepository.withProgramEncounterTypeIdUuids(encounterTypeIdList))
                        .and(programEncounterRepository.withProgramEncounterEarliestVisitDateTime(earliestVisitDateTime))
                        .and(programEncounterRepository.withProgramEncounterDateTime(encounterDateTime))
                        .and(completedEncounterSpecification)
                ,pageable).map(programEncounter -> programEncounterService.constructProgramEncounters(programEncounter));
        return programEncountersContract;
    }

    public void programEnrolmentSave(ProgramEnrolmentRequest request){
        logger.info(String.format("Saving programEnrolment with uuid %s", request.getUuid()));
        Program program;
        if (request.getProgramUUID() == null) {
            program = programRepository.findByName(request.getProgram());
        } else {
            program = programRepository.findByUuid(request.getProgramUUID());
        }
        ProgramOutcome programOutcome = programOutcomeRepository.findByUuid(request.getProgramOutcomeUUID());
        ProgramEnrolment programEnrolment = EntityHelper.newOrExistingEntity(programEnrolmentRepository,request, new ProgramEnrolment());
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

        Decisions decisions = request.getDecisions();
        if(decisions != null) {
            ObservationCollection observationsFromDecisions = observationService
                    .createObservationsFromDecisions(decisions.getEnrolmentDecisions());
            if(decisions.isExit()) {
                programEnrolment.getProgramExitObservations().putAll(observationsFromDecisions);
            } else {
                programEnrolment.getObservations().putAll(observationsFromDecisions);
            }
        }

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
}
