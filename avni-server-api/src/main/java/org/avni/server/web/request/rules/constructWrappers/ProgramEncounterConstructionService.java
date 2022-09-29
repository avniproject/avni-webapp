package org.avni.server.web.request.rules.constructWrappers;

import org.avni.server.dao.EncounterTypeRepository;
import org.avni.server.dao.IndividualRepository;
import org.avni.server.dao.ProgramEncounterRepository;
import org.avni.server.dao.ProgramEnrolmentRepository;
import org.avni.server.domain.*;
import org.avni.server.service.ObservationService;
import org.avni.server.web.request.rules.RulesContractWrapper.EncounterContractWrapper;
import org.avni.server.web.request.rules.RulesContractWrapper.ProgramEncounterContractWrapper;
import org.avni.server.web.request.rules.RulesContractWrapper.ProgramEnrolmentContractWrapper;
import org.avni.server.web.request.rules.RulesContractWrapper.VisitSchedule;
import org.avni.server.web.request.rules.request.EncounterRequestEntity;
import org.avni.server.web.request.rules.request.ProgramEncounterRequestEntity;
import org.avni.server.web.request.EncounterTypeContract;
import org.avni.server.web.request.ObservationContract;
import org.avni.server.web.request.ObservationModelContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProgramEncounterConstructionService {

    private final Logger logger;
    private final ObservationConstructionService observationConstructionService;
    private final ObservationService observationService;
    private final ProgramEnrolmentRepository programEnrolmentRepository;
    private final EncounterTypeRepository encounterTypeRepository;
    private final ProgramEncounterRepository programEncounterRepository;
    private final ProgramEnrolmentConstructionService programEnrolmentConstructionService;
    private final IndividualRepository individualRepository;

    @Autowired
    public ProgramEncounterConstructionService(
            ObservationConstructionService observationConstructionService,
            ObservationService observationService,
            ProgramEnrolmentRepository programEnrolmentRepository,
            EncounterTypeRepository encounterTypeRepository,
            ProgramEnrolmentConstructionService programEnrolmentConstructionService,
            IndividualRepository individualRepository,
            ProgramEncounterRepository programEncounterRepository) {
        logger = LoggerFactory.getLogger(this.getClass());
        this.observationService = observationService;
        this.observationConstructionService = observationConstructionService;
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.programEnrolmentConstructionService = programEnrolmentConstructionService;
        this.individualRepository = individualRepository;
        this.programEncounterRepository = programEncounterRepository;
    }

    public ProgramEncounterContractWrapper constructProgramEncounterContract(ProgramEncounterRequestEntity request) {
        ProgramEncounterContractWrapper programEncounterContractWrapper = new ProgramEncounterContractWrapper();
        programEncounterContractWrapper.setName(request.getName());
        programEncounterContractWrapper.setUuid(request.getUuid());
        programEncounterContractWrapper.setEncounterDateTime(request.getEncounterDateTime());
        programEncounterContractWrapper.setEarliestVisitDateTime(request.getEarliestVisitDateTime());
        programEncounterContractWrapper.setMaxVisitDateTime(request.getMaxVisitDateTime());
        programEncounterContractWrapper.setCancelDateTime(request.getCancelDateTime());
        programEncounterContractWrapper.setVoided(request.isVoided());
        if (request.getObservations() != null) {
            programEncounterContractWrapper.setObservations(request.getObservations().stream().map(x -> observationConstructionService.constructObservation(x)).collect(Collectors.toList()));
        }
        if (request.getCancelObservations() != null) {
            programEncounterContractWrapper.setCancelObservations(request.getCancelObservations().stream().map(x -> observationConstructionService.constructObservation(x)).collect(Collectors.toList()));
        }
        if (request.getProgramEnrolmentUUID() != null) {
            ProgramEnrolment programEnrolment = programEnrolmentRepository.findByUuid(request.getProgramEnrolmentUUID());
            ProgramEnrolmentContractWrapper enrolmentContract = constructEnrolments(programEnrolment, request.getUuid());
            programEncounterContractWrapper.setProgramEnrolment(enrolmentContract);
        }
        if (request.getEncounterTypeUUID() != null) {
            programEncounterContractWrapper.setEncounterType(constructEncounterType(request.getEncounterTypeUUID()));
        }
        return programEncounterContractWrapper;
    }

    public List<VisitSchedule> constructProgramEnrolmentVisitScheduleContract(ProgramEncounterRequestEntity requestEntity) {
        String currentProgramEncounterUuid = requestEntity.getUuid();
        ProgramEnrolment programEnrolment = programEnrolmentRepository.findByUuid(requestEntity.getProgramEnrolmentUUID());
        return programEnrolment == null ? new ArrayList<>() : programEnrolment.scheduledEncounters().filter(enc -> !enc.getUuid().equals(currentProgramEncounterUuid)).map(programEncounter -> {
            VisitSchedule visitSchedule = new VisitSchedule();
            visitSchedule.setEarliestDate(programEncounter.getEarliestVisitDateTime());
            visitSchedule.setMaxDate(programEncounter.getMaxVisitDateTime());
            visitSchedule.setName(programEncounter.getName());
            visitSchedule.setUuid(programEncounter.getUuid());
            visitSchedule.setEncounterType(programEncounter.getEncounterType().getOperationalEncounterTypeName());
            return visitSchedule;
        }).collect(Collectors.toList());
    }

    public List<VisitSchedule> constructIndividualVisitScheduleContract(EncounterRequestEntity requestEntity) {
        String currentEncounterUuid = requestEntity.getUuid();
        Individual individual = individualRepository.findByUuid(requestEntity.getIndividualUUID());
        return individual == null ? new ArrayList<>() : individual.scheduledEncounters().filter(enc -> !enc.getUuid().equals(currentEncounterUuid)).map(encounter -> {
            VisitSchedule visitSchedule = new VisitSchedule();
            visitSchedule.setEarliestDate(encounter.getEarliestVisitDateTime());
            visitSchedule.setMaxDate(encounter.getMaxVisitDateTime());
            visitSchedule.setName(encounter.getName());
            visitSchedule.setUuid(encounter.getUuid());
            visitSchedule.setEncounterType(encounter.getEncounterType().getOperationalEncounterTypeName());
            return visitSchedule;
        }).collect(Collectors.toList());
    }

    private EncounterTypeContract constructEncounterType(String encounterTypeUuid) {
        EncounterType encounterType = encounterTypeRepository.findByUuid(encounterTypeUuid);
        EncounterTypeContract encounterTypeContract = new EncounterTypeContract();
        return encounterTypeContract.fromEncounterType(encounterType);
    }

    private Set<ProgramEncounterContractWrapper> constructEncountersExcludingSelf(Set<ProgramEncounter> encounters, String selfEncounterUuid) {
        return encounters.stream()
                .filter(encounter -> !encounter.getUuid().equalsIgnoreCase(selfEncounterUuid))
                .map(this::constructProgramEncounterContractWrapper)
                .collect(Collectors.toSet());
    }

    public ProgramEncounterContractWrapper constructProgramEncounterContractWrapper(ProgramEncounter encounter) {
        ProgramEncounterContractWrapper programEncounterContractWrapper = new ProgramEncounterContractWrapper();
        EncounterTypeContract encounterTypeContract = new EncounterTypeContract();
        encounterTypeContract.setName(encounter.getEncounterType().getOperationalEncounterTypeName());
        programEncounterContractWrapper.setUuid(encounter.getUuid());
        programEncounterContractWrapper.setName(encounter.getName());
        programEncounterContractWrapper.setEncounterType(encounterTypeContract);
        programEncounterContractWrapper.setEncounterDateTime(encounter.getEncounterDateTime());
        programEncounterContractWrapper.setEarliestVisitDateTime(encounter.getEarliestVisitDateTime());
        programEncounterContractWrapper.setMaxVisitDateTime(encounter.getMaxVisitDateTime());
        programEncounterContractWrapper.setVoided(encounter.isVoided());
        if (encounter.getObservations() != null) {
            List<ObservationContract> observationContracts = observationService.constructObservations(encounter.getObservations());
            programEncounterContractWrapper.setObservations(getObservationModelContracts(observationContracts));
        }
        if (encounter.getCancelObservations() != null) {
            List<ObservationContract> observationContracts = observationService.constructObservations(encounter.getCancelObservations());
            programEncounterContractWrapper.setCancelObservations(getObservationModelContracts(observationContracts));
        }
        return programEncounterContractWrapper;
    }

    public ProgramEnrolmentContractWrapper constructEnrolments(ProgramEnrolment programEnrolment, String currentProgramEncounterUUID) {
        ProgramEnrolmentContractWrapper enrolmentContract = new ProgramEnrolmentContractWrapper();
        enrolmentContract.setUuid(programEnrolment.getUuid());
        enrolmentContract.setOperationalProgramName(programEnrolment.getProgram().getOperationalProgramName());
        enrolmentContract.setEnrolmentDateTime(programEnrolment.getEnrolmentDateTime());
        enrolmentContract.setProgramExitDateTime(programEnrolment.getProgramExitDateTime());
        enrolmentContract.setVoided(programEnrolment.isVoided());

        if (programEnrolment.getObservations() != null) {
            List<ObservationContract> observationContracts = observationService.constructObservations(programEnrolment.getObservations());
            enrolmentContract.setObservations(getObservationModelContracts(observationContracts));
        }
        if (programEnrolment.getProgramExitObservations() != null) {
            List<ObservationContract> observationContracts = observationService.constructObservations(programEnrolment.getProgramExitObservations());
            enrolmentContract.setExitObservations(getObservationModelContracts(observationContracts));
        }
        Set<ProgramEncounterContractWrapper> encountersContractList = constructEncountersExcludingSelf(programEnrolment.getProgramEncounters(), currentProgramEncounterUUID);
        enrolmentContract.setProgramEncounters(encountersContractList);
        enrolmentContract.setSubject(programEnrolmentConstructionService.getSubjectInfo(programEnrolment.getIndividual()));
        return enrolmentContract;
    }

    private List<ObservationModelContract> getObservationModelContracts(List<ObservationContract> observationContracts) {
        return observationContracts
                .stream()
                .map(observationService::constructObservation)
                .collect(Collectors.toList());
    }


    //Encounter Contract Construction
    public EncounterContractWrapper constructEncounterContract(EncounterRequestEntity encounterRequestEntity) {
        EncounterContractWrapper encounterContractWrapper = new EncounterContractWrapper();
        encounterContractWrapper.setUuid(encounterRequestEntity.getUuid());
        encounterContractWrapper.setName(encounterRequestEntity.getName());
        encounterContractWrapper.setEncounterDateTime(encounterRequestEntity.getEncounterDateTime());
        encounterContractWrapper.setCancelDateTime(encounterRequestEntity.getCancelDateTime());
        encounterContractWrapper.setEarliestVisitDateTime(encounterRequestEntity.getEarliestVisitDateTime());
        encounterContractWrapper.setMaxVisitDateTime(encounterRequestEntity.getMaxVisitDateTime());
        encounterContractWrapper.setVoided(encounterRequestEntity.isVoided());
        if (encounterRequestEntity.getObservations() != null) {
            encounterContractWrapper.setObservations(encounterRequestEntity.getObservations().stream().map(x -> observationConstructionService.constructObservation(x)).collect(Collectors.toList()));
        }
        if (encounterRequestEntity.getCancelObservations() != null) {
            encounterContractWrapper.setCancelObservations(encounterRequestEntity.getCancelObservations().stream().map(x -> observationConstructionService.constructObservation(x)).collect(Collectors.toList()));
        }
        if (encounterRequestEntity.getEncounterTypeUUID() != null) {
            encounterContractWrapper.setEncounterType(constructEncounterType(encounterRequestEntity.getEncounterTypeUUID()));
        }
        if (encounterRequestEntity.getIndividualUUID() != null) {
            Individual individual = individualRepository.findByUuid(encounterRequestEntity.getIndividualUUID());
            encounterContractWrapper.setSubject(programEnrolmentConstructionService.getSubjectInfo(individual));
        }
        return encounterContractWrapper;
    }

    public List<ProgramEnrolmentContractWrapper> mapEnrolments(Set<ProgramEnrolment> programEnrolments) {
        return programEnrolments.stream().map(programEnrolment -> {
            ProgramEnrolmentContractWrapper programEnrolmentContractWrapper = new ProgramEnrolmentContractWrapper();
            programEnrolmentContractWrapper.setEnrolmentDateTime(programEnrolment.getEnrolmentDateTime());
            programEnrolmentContractWrapper.setProgramExitDateTime(programEnrolment.getProgramExitDateTime());
            programEnrolmentContractWrapper.setUuid(programEnrolment.getUuid());
            programEnrolmentContractWrapper.setVoided(programEnrolment.isVoided());
            return programEnrolmentContractWrapper;
        }).collect(Collectors.toList());
    }

    public List<EncounterContractWrapper> mapEncounters(Set<Encounter> encounters) {
        return encounters.stream().map(encounter -> {
            EncounterContractWrapper encounterContractWrapper = new EncounterContractWrapper();
            encounterContractWrapper.setUuid(encounter.getUuid());
            encounterContractWrapper.setName(encounter.getName());
            encounterContractWrapper.setEncounterDateTime(encounter.getEncounterDateTime());
            encounterContractWrapper.setEarliestVisitDateTime(encounter.getEarliestVisitDateTime());
            encounterContractWrapper.setMaxVisitDateTime(encounter.getMaxVisitDateTime());
            encounterContractWrapper.setVoided(encounter.isVoided());
            encounterContractWrapper.setEncounterType(EncounterTypeContract.fromEncounterType(encounter.getEncounterType()));
            return encounterContractWrapper;
        }).collect(Collectors.toList());
    }
}
