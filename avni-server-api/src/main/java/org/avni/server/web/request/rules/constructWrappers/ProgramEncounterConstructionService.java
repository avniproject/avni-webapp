package org.avni.server.web.request.rules.constructWrappers;

import org.avni.server.dao.EncounterTypeRepository;
import org.avni.server.dao.IndividualRepository;
import org.avni.server.dao.ProgramEnrolmentRepository;
import org.avni.server.domain.*;
import org.avni.server.service.ObservationService;
import org.avni.server.web.request.EntityTypeContract;
import org.avni.server.web.request.ObservationContract;
import org.avni.server.web.request.ObservationModelContract;
import org.avni.server.web.request.rules.RulesContractWrapper.EncounterContract;
import org.avni.server.web.request.rules.RulesContractWrapper.ProgramEncounterContract;
import org.avni.server.web.request.rules.RulesContractWrapper.ProgramEnrolmentContract;
import org.avni.server.web.request.rules.RulesContractWrapper.VisitSchedule;
import org.avni.server.web.request.rules.request.EncounterRequestEntity;
import org.avni.server.web.request.rules.request.ProgramEncounterRequestEntity;
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
    private final IndividualConstructionService individualConstructionService;
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
            IndividualConstructionService individualConstructionService) {
        this.individualConstructionService = individualConstructionService;
        logger = LoggerFactory.getLogger(this.getClass());
        this.observationService = observationService;
        this.observationConstructionService = observationConstructionService;
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.programEnrolmentConstructionService = programEnrolmentConstructionService;
        this.individualRepository = individualRepository;
    }

    public ProgramEncounterContract constructProgramEncounterContract(ProgramEncounterRequestEntity request) {
        ProgramEncounterContract programEncounterContract = new ProgramEncounterContract();
        programEncounterContract.setName(request.getName());
        programEncounterContract.setUuid(request.getUuid());
        programEncounterContract.setEncounterDateTime(request.getEncounterDateTime());
        programEncounterContract.setEarliestVisitDateTime(request.getEarliestVisitDateTime());
        programEncounterContract.setMaxVisitDateTime(request.getMaxVisitDateTime());
        programEncounterContract.setCancelDateTime(request.getCancelDateTime());
        programEncounterContract.setVoided(request.isVoided());
        if (request.getObservations() != null) {
            programEncounterContract.setObservations(request.getObservations().stream().map(x -> observationConstructionService.constructObservation(x)).collect(Collectors.toList()));
        }
        if (request.getCancelObservations() != null) {
            programEncounterContract.setCancelObservations(request.getCancelObservations().stream().map(x -> observationConstructionService.constructObservation(x)).collect(Collectors.toList()));
        }
        if (request.getProgramEnrolmentUUID() != null) {
            ProgramEnrolment programEnrolment = programEnrolmentRepository.findByUuid(request.getProgramEnrolmentUUID());
            ProgramEnrolmentContract enrolmentContract = constructEnrolments(programEnrolment, request.getUuid());
            programEncounterContract.setProgramEnrolment(enrolmentContract);
        }
        if (request.getEncounterTypeUUID() != null) {
            programEncounterContract.setEncounterType(constructEncounterType(request.getEncounterTypeUUID()));
        }
        return programEncounterContract;
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

    private EntityTypeContract constructEncounterType(String encounterTypeUuid) {
        EncounterType encounterType = encounterTypeRepository.findByUuid(encounterTypeUuid);
        EntityTypeContract entityTypeContract = new EntityTypeContract();
        return entityTypeContract.fromEncounterType(encounterType);
    }

    private Set<ProgramEncounterContract> constructEncountersExcludingSelf(Set<ProgramEncounter> encounters, String selfEncounterUuid) {
        return encounters.stream()
                .filter(encounter -> !encounter.getUuid().equalsIgnoreCase(selfEncounterUuid))
                .map(this::constructProgramEncounterContractWrapper)
                .collect(Collectors.toSet());
    }

    public ProgramEncounterContract constructProgramEncounterContractWrapper(ProgramEncounter encounter) {
        ProgramEncounterContract programEncounterContract = new ProgramEncounterContract();
        EntityTypeContract entityTypeContract = new EntityTypeContract();
        entityTypeContract.setName(encounter.getEncounterType().getOperationalEncounterTypeName());
        programEncounterContract.setUuid(encounter.getUuid());
        programEncounterContract.setName(encounter.getName());
        programEncounterContract.setEncounterType(entityTypeContract);
        programEncounterContract.setEncounterDateTime(encounter.getEncounterDateTime());
        programEncounterContract.setEarliestVisitDateTime(encounter.getEarliestVisitDateTime());
        programEncounterContract.setMaxVisitDateTime(encounter.getMaxVisitDateTime());
        programEncounterContract.setVoided(encounter.isVoided());
        if (encounter.getObservations() != null) {
            List<ObservationContract> observationContracts = observationService.constructObservations(encounter.getObservations());
            programEncounterContract.setObservations(getObservationModelContracts(observationContracts));
        }
        if (encounter.getCancelObservations() != null) {
            List<ObservationContract> observationContracts = observationService.constructObservations(encounter.getCancelObservations());
            programEncounterContract.setCancelObservations(getObservationModelContracts(observationContracts));
        }
        return programEncounterContract;
    }

    public ProgramEnrolmentContract constructEnrolments(ProgramEnrolment programEnrolment, String currentProgramEncounterUUID) {
        ProgramEnrolmentContract enrolmentContract = new ProgramEnrolmentContract();
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
        Set<ProgramEncounterContract> encountersContractList = constructEncountersExcludingSelf(programEnrolment.getProgramEncounters(), currentProgramEncounterUUID);
        enrolmentContract.setProgramEncounters(encountersContractList);
        enrolmentContract.setSubject(individualConstructionService.getSubjectInfo(programEnrolment.getIndividual()));
        return enrolmentContract;
    }

    private List<ObservationModelContract> getObservationModelContracts(List<ObservationContract> observationContracts) {
        return observationContracts
                .stream()
                .map(observationService::constructObservation)
                .collect(Collectors.toList());
    }


    //Encounter Contract Construction
    public EncounterContract constructEncounterContract(EncounterRequestEntity encounterRequestEntity) {
        EncounterContract encounterContract = new EncounterContract();
        encounterContract.setUuid(encounterRequestEntity.getUuid());
        encounterContract.setName(encounterRequestEntity.getName());
        encounterContract.setEncounterDateTime(encounterRequestEntity.getEncounterDateTime());
        encounterContract.setCancelDateTime(encounterRequestEntity.getCancelDateTime());
        encounterContract.setEarliestVisitDateTime(encounterRequestEntity.getEarliestVisitDateTime());
        encounterContract.setMaxVisitDateTime(encounterRequestEntity.getMaxVisitDateTime());
        encounterContract.setVoided(encounterRequestEntity.isVoided());
        if (encounterRequestEntity.getObservations() != null) {
            encounterContract.setObservations(encounterRequestEntity.getObservations().stream().map(x -> observationConstructionService.constructObservation(x)).collect(Collectors.toList()));
        }
        if (encounterRequestEntity.getCancelObservations() != null) {
            encounterContract.setCancelObservations(encounterRequestEntity.getCancelObservations().stream().map(x -> observationConstructionService.constructObservation(x)).collect(Collectors.toList()));
        }
        if (encounterRequestEntity.getEncounterTypeUUID() != null) {
            encounterContract.setEncounterType(constructEncounterType(encounterRequestEntity.getEncounterTypeUUID()));
        }
        if (encounterRequestEntity.getIndividualUUID() != null) {
            Individual individual = individualRepository.findByUuid(encounterRequestEntity.getIndividualUUID());
            encounterContract.setSubject(individualConstructionService.getSubjectInfo(individual));
        }
        return encounterContract;
    }

    public List<ProgramEnrolmentContract> mapEnrolments(Set<ProgramEnrolment> programEnrolments) {
        return programEnrolments.stream().map(programEnrolment -> {
            ProgramEnrolmentContract programEnrolmentContractWrapper = new ProgramEnrolmentContract();
            programEnrolmentContractWrapper.setEnrolmentDateTime(programEnrolment.getEnrolmentDateTime());
            programEnrolmentContractWrapper.setProgramExitDateTime(programEnrolment.getProgramExitDateTime());
            programEnrolmentContractWrapper.setUuid(programEnrolment.getUuid());
            programEnrolmentContractWrapper.setVoided(programEnrolment.isVoided());
            return programEnrolmentContractWrapper;
        }).collect(Collectors.toList());
    }

    public List<EncounterContract> mapEncounters(Set<Encounter> encounters) {
        return encounters.stream().map(encounter -> {
            EncounterContract encounterContract = new EncounterContract();
            encounterContract.setUuid(encounter.getUuid());
            encounterContract.setName(encounter.getName());
            encounterContract.setEncounterDateTime(encounter.getEncounterDateTime());
            encounterContract.setEarliestVisitDateTime(encounter.getEarliestVisitDateTime());
            encounterContract.setMaxVisitDateTime(encounter.getMaxVisitDateTime());
            encounterContract.setVoided(encounter.isVoided());
            encounterContract.setEncounterType(EntityTypeContract.fromEncounterType(encounter.getEncounterType()));
            return encounterContract;
        }).collect(Collectors.toList());
    }
}
