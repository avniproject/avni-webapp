package org.openchs.service;

import com.bugsnag.Bugsnag;
import org.openchs.common.EntityHelper;
import org.openchs.dao.EncounterTypeRepository;
import org.openchs.dao.ProgramEncounterRepository;
import org.openchs.dao.ProgramEnrolmentRepository;
import org.openchs.dao.individualRelationship.RuleFailureLogRepository;
import org.openchs.domain.*;
import org.openchs.geo.Point;
import org.openchs.web.AbstractController;
import org.openchs.web.IndividualController;
import org.openchs.web.request.EncounterTypeContract;
import org.openchs.web.request.PointRequest;
import org.openchs.web.request.ProgramEncounterRequest;
import org.openchs.web.request.ProgramEncountersContract;
import org.openchs.web.request.rules.RulesContractWrapper.VisitSchedule;
import org.openchs.web.request.rules.constant.EntityEnum;
import org.openchs.web.request.rules.constant.RuleEnum;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProgramEncounterService {
    private static org.slf4j.Logger logger = LoggerFactory.getLogger(ProgramEncounterService.class);
    @Autowired
    Bugsnag bugsnag;
    private ProgramEncounterRepository programEncounterRepository;
    private IndividualService individualService;
    private EncounterTypeRepository encounterTypeRepository;
    private ObservationService observationService;
    private ProgramEnrolmentRepository programEnrolmentRepository;
    private RuleFailureLogRepository ruleFailureLogRepository;

    @Autowired
    public ProgramEncounterService(ProgramEncounterRepository programEncounterRepository,IndividualService individualService,EncounterTypeRepository encounterTypeRepository,ObservationService observationService,ProgramEnrolmentRepository programEnrolmentRepository,RuleFailureLogRepository ruleFailureLogRepository) {
        this.programEncounterRepository = programEncounterRepository;
        this.individualService = individualService;
        this.encounterTypeRepository = encounterTypeRepository;
        this.observationService = observationService;
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.ruleFailureLogRepository = ruleFailureLogRepository;
    }

    public ProgramEncountersContract getProgramEncounterByUuid(String uuid) {
        ProgramEncounter programEncounter = programEncounterRepository.findByUuid(uuid);
        return constructProgramEncounters(programEncounter);
    }

    public ProgramEncountersContract constructProgramEncounters(ProgramEncounter programEncounter) {
            ProgramEncountersContract programEncountersContract = new ProgramEncountersContract();
            EncounterTypeContract encounterTypeContract = new EncounterTypeContract();
            encounterTypeContract.setName(programEncounter.getEncounterType().getName());
            encounterTypeContract.setUuid(programEncounter.getEncounterType().getUuid());
            encounterTypeContract.setEncounterEligibilityCheckRule(programEncounter.getEncounterType().getEncounterEligibilityCheckRule());
            programEncountersContract.setUuid(programEncounter.getUuid());
            programEncountersContract.setName(programEncounter.getName());
            programEncountersContract.setEncounterType(encounterTypeContract);
            programEncountersContract.setEncounterDateTime(programEncounter.getEncounterDateTime());
            programEncountersContract.setCancelDateTime(programEncounter.getCancelDateTime());
            programEncountersContract.setEarliestVisitDateTime(programEncounter.getEarliestVisitDateTime());
            programEncountersContract.setMaxVisitDateTime(programEncounter.getMaxVisitDateTime());
            programEncountersContract.setVoided(programEncounter.isVoided());
            if(programEncounter.getObservations() != null) {
                programEncountersContract.setObservations(individualService.constructObservations(programEncounter.getObservations()));
            }
            if(programEncounter.getCancelObservations() != null) {
                programEncountersContract.setCancelObservations(individualService.constructObservations(programEncounter.getCancelObservations()));
            }
        return  programEncountersContract;
    }

    public ProgramEnrolment getAllEncountersForEnrolment(String uuid){
        ProgramEnrolment programEnrolment = programEnrolmentRepository.findByUuid(uuid);
        return programEnrolment;
    }

    public List<ProgramEncounter> constructVisitSchedules(ProgramEnrolment programEnrolment,String encounterTypeName){
        return programEnrolment.getProgramEncounters().stream().filter(programEncounter -> programEncounter.getEncounterType().getName().equals(encounterTypeName)).collect(Collectors.toList());
    }

    public void saveVisitSchedules(String uuid,List<VisitSchedule> visitSchedules){
        ProgramEnrolment programEnrolment = getAllEncountersForEnrolment(uuid);
        for( VisitSchedule visitSchedule : visitSchedules){
            try {
                processVisitSchedule(programEnrolment, visitSchedule);
            }catch (Exception e){
                RuleFailureLog ruleFailureLog = RuleFailureLog.createInstance(uuid,"Save : Visit Schedule Rule",uuid,"Save : "+ EntityEnum.PROGRAM_ENCOUNTER_ENTITY.getEntityName(),"Web",e);
                ruleFailureLogRepository.save(ruleFailureLog);
            }
        }
    }

    public void processVisitSchedule(ProgramEnrolment programEnrolment ,VisitSchedule visitSchedule) throws Exception {
        List<ProgramEncounter> allScheduleEncountersByType = constructVisitSchedules(programEnrolment,visitSchedule.getEncounterType());
        if(allScheduleEncountersByType.isEmpty() || "createNew".equals(visitSchedule.getVisitCreationStrategy())){
            EncounterType encounterType = encounterTypeRepository.findByName(visitSchedule.getEncounterType());
            if(encounterType == null){
                throw new Exception("NextScheduled visit is for encounter type="+visitSchedule.getName()+" that doesn't exist");
            }
            ProgramEncounter programEncounter = createEmptyProgramEncounter(programEnrolment,encounterType);
            allScheduleEncountersByType.add(programEncounter);
        }
        allScheduleEncountersByType.stream().forEach( programEncounter -> {
            updateProgramEncounterWithVisitSchedule(programEncounter,visitSchedule);
            programEncounterRepository.save(programEncounter);
        });
    }

    public void updateProgramEncounterWithVisitSchedule(ProgramEncounter programEncounter, VisitSchedule visitSchedule){
        programEncounter.setEarliestVisitDateTime(visitSchedule.getEarliestDate());
        programEncounter.setMaxVisitDateTime(visitSchedule.getMaxDate());
        programEncounter.setName(visitSchedule.getName());
    }

    public ProgramEncounter createEmptyProgramEncounter(ProgramEnrolment programEnrolment,EncounterType encounterType){
        ProgramEncounter programEncounter = new ProgramEncounter();
        programEncounter.setEncounterType(encounterType);
        programEncounter.setProgramEnrolment(programEnrolment);
        programEncounter.setEncounterDateTime(null);
        programEncounter.setUuid(UUID.randomUUID().toString());
        programEncounter.setVoided(false);
        programEncounter.setObservations(new ObservationCollection());
        programEncounter.setCancelObservations(new ObservationCollection());
        return programEncounter;
    }

    public void saveProgramEncounters(ProgramEncounterRequest request){
        logger.info(String.format("Saving programEncounter with uuid %s", request.getUuid()));
        checkForSchedulingCompleteConstraintViolation(request);
        EncounterType encounterType = encounterTypeRepository.findByUuidOrName(request.getEncounterType(), request.getEncounterTypeUUID());
        ProgramEncounter encounter = EntityHelper.newOrExistingEntity(programEncounterRepository,request, new ProgramEncounter());
        //Planned visit can not overwrite completed encounter
        if (encounter.isCompleted() && request.isPlanned())
            return;

        encounter.setEncounterDateTime(request.getEncounterDateTime());
        encounter.setProgramEnrolment(programEnrolmentRepository.findByUuid(request.getProgramEnrolmentUUID()));
        encounter.setEncounterType(encounterType);
        encounter.setObservations(observationService.createObservations(request.getObservations()));
        encounter.setName(request.getName());
        encounter.setEarliestVisitDateTime(request.getEarliestVisitDateTime());
        encounter.setMaxVisitDateTime(request.getMaxVisitDateTime());
        encounter.setCancelDateTime(request.getCancelDateTime());
        encounter.setCancelObservations(observationService.createObservations(request.getCancelObservations()));
        PointRequest encounterLocation = request.getEncounterLocation();
        if (encounterLocation != null)
            encounter.setEncounterLocation(new Point(encounterLocation.getX(), encounterLocation.getY()));
        PointRequest cancelLocation = request.getCancelLocation();
        if (cancelLocation != null)
            encounter.setCancelLocation(new Point(cancelLocation.getX(), cancelLocation.getY()));

        programEncounterRepository.save(encounter);
        logger.info(String.format("Saved programEncounter with uuid %s", request.getUuid()));
    }

    private void checkForSchedulingCompleteConstraintViolation(ProgramEncounterRequest request) {
        if ((request.getEarliestVisitDateTime() != null || request.getMaxVisitDateTime() != null)
                && (request.getEarliestVisitDateTime() == null || request.getMaxVisitDateTime() == null)
        ) {
            //violating constraint so notify bugsnag
            bugsnag.notify(new Exception(String.format("ProgramEncounter violating scheduling constraint uuid %s earliest %s max %s", request.getUuid(), request.getEarliestVisitDateTime(), request.getMaxVisitDateTime())));
        }

    }

}