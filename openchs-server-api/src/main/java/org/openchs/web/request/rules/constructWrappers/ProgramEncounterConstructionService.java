package org.openchs.web.request.rules.constructWrappers;

import org.openchs.dao.EncounterTypeRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.dao.ProgramEnrolmentRepository;
import org.openchs.domain.*;
import org.openchs.web.request.EncounterTypeContract;
import org.openchs.web.request.EnrolmentContract;
import org.openchs.web.request.ProgramEncountersContract;
import org.openchs.web.request.rules.RulesContractWrapper.EncounterContractWrapper;
import org.openchs.web.request.rules.RulesContractWrapper.IndividualContractWrapper;
import org.openchs.web.request.rules.RulesContractWrapper.ProgramEncounterContractWrapper;
import org.openchs.web.request.rules.RulesContractWrapper.ProgramEnrolmentContractWrapper;
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
    private final ProgramEnrolmentRepository programEnrolmentRepository;
    private final EncounterTypeRepository encounterTypeRepository;
    private final ProgramEnrolmentConstructionService programEnrolmentConstructionService;
    private final IndividualRepository individualRepository;

    @Autowired
    public ProgramEncounterConstructionService(
            ObservationConstructionService observationConstructionService,
            ProgramEnrolmentRepository programEnrolmentRepository,
            EncounterTypeRepository encounterTypeRepository,
            ProgramEnrolmentConstructionService programEnrolmentConstructionService,
            IndividualRepository individualRepository) {
        logger = LoggerFactory.getLogger(this.getClass());
        this.observationConstructionService = observationConstructionService;
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.programEnrolmentConstructionService = programEnrolmentConstructionService;
        this.individualRepository = individualRepository;
    }

    public ProgramEncounterContractWrapper constructProgramEncounterContract(ProgramEncounterRequestEntity programEncounterRequestEntity) {
        ProgramEncounterContractWrapper programEncounterContractWrapper = new ProgramEncounterContractWrapper();
        programEncounterContractWrapper.setUuid(programEncounterRequestEntity.getUuid());
        programEncounterContractWrapper.setEncounterDateTime(programEncounterRequestEntity.getEncounterDateTime());
        programEncounterContractWrapper.setEarliestVisitDateTime(programEncounterRequestEntity.getEarliestVisitDateTime());
        programEncounterContractWrapper.setMaxVisitDateTime(programEncounterRequestEntity.getMaxVisitDateTime());
        programEncounterContractWrapper.setCancelDateTime(programEncounterRequestEntity.getCancelDateTime());
        if(programEncounterRequestEntity.getObservations() != null){
            programEncounterContractWrapper.setObservations(programEncounterRequestEntity.getObservations().stream().map( x -> observationConstructionService.constructObservation(x)).collect(Collectors.toList()));
        }
        if(programEncounterRequestEntity.getProgramEnrolmentUUID() != null) {
            ProgramEnrolment programEnrolment = programEnrolmentRepository.findByUuid(programEncounterRequestEntity.getProgramEnrolmentUUID());
            EnrolmentContract enrolmentContract = constructEnrolments(programEnrolment);
            Set<ProgramEncountersContract> encountersContractList = constructEncounters(programEnrolment.getProgramEncounters(), programEncounterRequestEntity.getUuid());
            enrolmentContract.setProgramEncounters(encountersContractList);
            programEncounterContractWrapper.setProgramEnrolment(enrolmentContract);
        }
        if(programEncounterRequestEntity.getEncounterTypeUUID() != null) {
            programEncounterContractWrapper.setEncounterType(constructEncounterType(programEncounterRequestEntity.getEncounterTypeUUID()));
        }
        return programEncounterContractWrapper;
    }

    private EncounterTypeContract constructEncounterType(String encounterTypeUuid){
        EncounterType encounterType = encounterTypeRepository.findByUuid(encounterTypeUuid);
        EncounterTypeContract encounterTypeContract = new EncounterTypeContract();
       return encounterTypeContract.fromEncounterType(encounterType);
    }

    private Set<ProgramEncountersContract> constructEncounters(Set<ProgramEncounter> encounters, String selfEncounterUuid) {
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

    public EnrolmentContract constructEnrolments(ProgramEnrolment programEnrolment) {
        EnrolmentContract enrolmentContract = new EnrolmentContract();
        enrolmentContract.setUuid(programEnrolment.getUuid());
        enrolmentContract.setOperationalProgramName(programEnrolment.getProgram().getName());
        enrolmentContract.setEnrolmentDateTime(programEnrolment.getEnrolmentDateTime());
        enrolmentContract.setProgramExitDateTime(programEnrolment.getProgramExitDateTime());
        enrolmentContract.setVoided(programEnrolment.isVoided());
        return enrolmentContract;
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