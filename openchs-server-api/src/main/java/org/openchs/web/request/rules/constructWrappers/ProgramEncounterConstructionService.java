package org.openchs.web.request.rules.constructWrappers;

import org.openchs.dao.EncounterTypeRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.dao.ProgramEncounterRepository;
import org.openchs.dao.ProgramEnrolmentRepository;
import org.openchs.domain.*;
import org.openchs.service.ObservationService;
import org.openchs.web.request.EncounterTypeContract;
import org.openchs.web.request.ObservationContract;
import org.openchs.web.request.ObservationModelContract;
import org.openchs.web.request.ProgramEncountersContract;
import org.openchs.web.request.rules.RulesContractWrapper.*;
import org.openchs.web.request.rules.request.EncounterRequestEntity;
import org.openchs.web.request.rules.request.ProgramEncounterRequestEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        if(request.getObservations() != null){
            programEncounterContractWrapper.setObservations(request.getObservations().stream().map( x -> observationConstructionService.constructObservation(x)).collect(Collectors.toList()));
        }
        if(request.getCancelObservations() != null){
            programEncounterContractWrapper.setCancelObservations(request.getCancelObservations().stream().map( x -> observationConstructionService.constructObservation(x)).collect(Collectors.toList()));
        }
        if(request.getProgramEnrolmentUUID() != null) {
            ProgramEnrolment programEnrolment = programEnrolmentRepository.findByUuid(request.getProgramEnrolmentUUID());
            ProgramEnrolmentContractWrapper enrolmentContract = constructEnrolments(programEnrolment);
            Set<ProgramEncountersContract> encountersContractList = constructEncountersExcludingSelf(programEnrolment.getProgramEncounters(), request.getUuid());
            enrolmentContract.setProgramEncounters(encountersContractList);
            enrolmentContract.setSubject(programEnrolmentConstructionService.getSubjectInfo(programEnrolment.getIndividual()));
            programEncounterContractWrapper.setProgramEnrolment(enrolmentContract);
        }
        if(request.getEncounterTypeUUID() != null) {
            programEncounterContractWrapper.setEncounterType(constructEncounterType(request.getEncounterTypeUUID()));
        }
        return programEncounterContractWrapper;
    }

    public List<VisitSchedule> constructProgramEnrolmentVisitScheduleContract(String uuid){
        ProgramEnrolment programEnrolment = programEnrolmentRepository.findByUuid(uuid);
        return programEnrolment.getProgramEncounters().stream().map( programEncounter -> {
            VisitSchedule visitSchedule = new VisitSchedule();
            visitSchedule.setEarliestDate(programEncounter.getEarliestVisitDateTime());
            visitSchedule.setMaxDate(programEncounter.getMaxVisitDateTime());
            visitSchedule.setName(programEncounter.getName());
            visitSchedule.setUuid(programEncounter.getUuid());
            visitSchedule.setEncounterType(programEncounter.getEncounterType().getOperationalEncounterTypeName());
            return visitSchedule;
        }).collect(Collectors.toList());
    }

    private EncounterTypeContract constructEncounterType(String encounterTypeUuid){
        EncounterType encounterType = encounterTypeRepository.findByUuid(encounterTypeUuid);
        EncounterTypeContract encounterTypeContract = new EncounterTypeContract();
       return encounterTypeContract.fromEncounterType(encounterType);
    }

    private Set<ProgramEncountersContract> constructEncountersExcludingSelf(Set<ProgramEncounter> encounters, String selfEncounterUuid) {
        return encounters.stream().filter(encounter -> !encounter.getUuid().equalsIgnoreCase(selfEncounterUuid)).map(encounter -> {
            ProgramEncountersContract encountersContract = new ProgramEncountersContract();
            EncounterTypeContract encounterTypeContract = new EncounterTypeContract();
            encounterTypeContract.setName(encounter.getEncounterType().getOperationalEncounterTypeName());
            encountersContract.setUuid(encounter.getUuid());
            encountersContract.setName(encounter.getName());
            encountersContract.setEncounterType(encounterTypeContract);
            encountersContract.setEncounterDateTime(encounter.getEncounterDateTime());
            encountersContract.setEarliestVisitDateTime(encounter.getEarliestVisitDateTime());
            encountersContract.setMaxVisitDateTime(encounter.getMaxVisitDateTime());
            encountersContract.setVoided(encounter.isVoided());
            return encountersContract;
        }).collect(Collectors.toSet());
    }

    public ProgramEnrolmentContractWrapper constructEnrolments(ProgramEnrolment programEnrolment) {
        ProgramEnrolmentContractWrapper enrolmentContract = new ProgramEnrolmentContractWrapper();
        enrolmentContract.setUuid(programEnrolment.getUuid());
        enrolmentContract.setOperationalProgramName(programEnrolment.getProgram().getOperationalProgramName());
        enrolmentContract.setEnrolmentDateTime(programEnrolment.getEnrolmentDateTime());
        enrolmentContract.setProgramExitDateTime(programEnrolment.getProgramExitDateTime());
        enrolmentContract.setVoided(programEnrolment.isVoided());

        if(programEnrolment.getObservations() != null){
            List<ObservationContract> observationContracts = observationService.constructObservations(programEnrolment.getObservations());
            enrolmentContract.setObservations(getObservationModelContracts(observationContracts));
        }
        if(programEnrolment.getProgramExitObservations() != null) {
            List<ObservationContract> observationContracts = observationService.constructObservations(programEnrolment.getProgramExitObservations());
            enrolmentContract.setExitObservations(getObservationModelContracts(observationContracts));
        }

        return enrolmentContract;
    }

    private List<ObservationModelContract> getObservationModelContracts(List<ObservationContract> observationContracts) {
        return observationContracts
                .stream()
                .map(observationConstructionService::constructObservation)
                .collect(Collectors.toList());
    }


    //Encounter Contract Construction
    public EncounterContractWrapper constructEncounterContract(EncounterRequestEntity encounterRequestEntity){
        EncounterContractWrapper encounterContractWrapper = new EncounterContractWrapper();
        encounterContractWrapper.setUuid(encounterRequestEntity.getUuid());
        encounterContractWrapper.setEncounterDateTime(encounterRequestEntity.getEncounterDateTime());
        encounterContractWrapper.setCancelDateTime(encounterRequestEntity.getCancelDateTime());
        encounterContractWrapper.setEarliestVisitDateTime(encounterRequestEntity.getEarliestVisitDateTime());
        encounterContractWrapper.setMaxVisitDateTime(encounterRequestEntity.getMaxVisitDateTime());
        if(encounterRequestEntity.getObservations() != null){
            encounterContractWrapper.setObservations(encounterRequestEntity.getObservations().stream().map( x -> observationConstructionService.constructObservation(x)).collect(Collectors.toList()));
        }
        if(encounterRequestEntity.getEncounterTypeUUID() != null) {
            encounterContractWrapper.setEncounterType(constructEncounterType(encounterRequestEntity.getEncounterTypeUUID()));
        }
        if(encounterRequestEntity.getIndividualUUID() != null) {
            Individual individual = individualRepository.findByUuid(encounterRequestEntity.getIndividualUUID());
            encounterContractWrapper.setSubject(programEnrolmentConstructionService.getSubjectInfo(individual));
            IndividualContractWrapper individualContractWrapper = encounterContractWrapper.getSubject();
            individualContractWrapper.setEnrolments(mapEnrolments(individual.getProgramEnrolments()));
            individualContractWrapper.setEncounters(mapEncounters(individual.getEncounters()));
        }
        return encounterContractWrapper;
    }

    public List<ProgramEnrolmentContractWrapper> mapEnrolments(Set<ProgramEnrolment> programEnrolments){
       return programEnrolments.stream().map(programEnrolment -> {
            ProgramEnrolmentContractWrapper programEnrolmentContractWrapper = new ProgramEnrolmentContractWrapper();
            programEnrolmentContractWrapper.setEnrolmentDateTime(programEnrolment.getEnrolmentDateTime());
            programEnrolmentContractWrapper.setProgramExitDateTime(programEnrolment.getProgramExitDateTime());
            programEnrolmentContractWrapper.setUuid(programEnrolment.getUuid());
            programEnrolmentContractWrapper.setVoided(programEnrolment.isVoided());
            return programEnrolmentContractWrapper;
        }).collect(Collectors.toList());
    }

    public List<EncounterContractWrapper> mapEncounters(Set<Encounter> encounters){
        return encounters.stream().map(encounter -> {
            EncounterContractWrapper encounterContractWrapper = new EncounterContractWrapper();
            encounterContractWrapper.setUuid(encounter.getUuid());
            encounterContractWrapper.setName(encounter.getName());
            encounterContractWrapper.setEncounterDateTime(encounter.getEncounterDateTime());
            encounterContractWrapper.setEarliestVisitDateTime(encounter.getEarliestVisitDateTime());
            encounterContractWrapper.setMaxVisitDateTime(encounter.getMaxVisitDateTime());
            encounterContractWrapper.setVoided(encounter.isVoided());
            return encounterContractWrapper;
        }).collect(Collectors.toList());
    }
}
