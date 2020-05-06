package org.openchs.service;

import org.joda.time.DateTime;
import org.openchs.dao.ProgramEncounterRepository;
import org.openchs.dao.ProgramEnrolmentRepository;
import org.openchs.domain.Individual;
import org.openchs.domain.ProgramEncounter;
import org.openchs.domain.ProgramEnrolment;
import org.openchs.web.request.ProgramEncountersContract;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.openchs.web.request.EnrolmentContract;
import org.openchs.web.request.ObservationContract;
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
    private ProgramEnrolmentRepository programEnrolmentRepository;
    private IndividualService individualService;
    private ProgramEncounterService programEncounterService;
    private ProgramEncounterRepository programEncounterRepository;
    public ProgramEnrolmentService(ProgramEnrolmentRepository programEnrolmentRepository,ProgramEncounterService programEncounterService,ProgramEncounterRepository programEncounterRepository,IndividualService individualService) {
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.individualService = individualService;
        this.programEncounterService = programEncounterService;
        this.programEncounterRepository = programEncounterRepository;
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
        enrolmentContract.setOperationalProgramName(programEnrolment.getProgram().getName());
        enrolmentContract.setEnrolmentDateTime(programEnrolment.getEnrolmentDateTime());
        enrolmentContract.setProgramExitDateTime(programEnrolment.getProgramExitDateTime());
        enrolmentContract.setVoided(programEnrolment.isVoided());
        List<ObservationContract> observationContractsList = individualService.constructObservations(programEnrolment.getObservations());
        enrolmentContract.setObservations(observationContractsList);
        if (programEnrolment.getProgramExitObservations() != null) {
            enrolmentContract.setExitObservations(individualService.constructObservations(programEnrolment.getProgramExitObservations()));
        }
        return enrolmentContract;
    }

    public Page<ProgramEncountersContract> getAllCompletedEncounters(Long id, String encounterTypeIds, DateTime encounterDateTime, DateTime earliestVisitDateTime, Pageable pageable){
        Page<ProgramEncountersContract> programEncountersContract = null;
        List<Long> encounterTypeIdList = new ArrayList<>();
        if(encounterTypeIds != null) {
            encounterTypeIdList = Arrays.stream(encounterTypeIds.split(",")).map(Long::parseLong).collect(Collectors.toList());
        }
        programEncountersContract = programEncounterRepository.findAll(
                where(programEncounterRepository.withProgramEncounterId(id))
                .and(programEncounterRepository.withProgramEncounterTypeIdIn(encounterTypeIdList))
                .and(programEncounterRepository.withProgramEncounterEarliestVisitDateTime(earliestVisitDateTime))
                .and(programEncounterRepository.withProgramEncounterDateTime(encounterDateTime))
                .and(programEncounterRepository.withNotNullEncounterDateTime())
                ,pageable).map(programEncounter -> programEncounterService.constructProgramEncounters(programEncounter));
        return programEncountersContract;
    }
}
