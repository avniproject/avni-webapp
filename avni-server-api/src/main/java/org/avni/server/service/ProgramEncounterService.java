package org.avni.server.service;

import com.bugsnag.Bugsnag;
import org.avni.server.common.EntityHelper;
import org.avni.server.dao.*;
import org.avni.server.dao.application.FormMappingRepository;
import org.avni.server.domain.*;
import org.avni.server.geo.Point;
import org.avni.server.util.BadRequestError;
import org.avni.server.web.request.EncounterTypeContract;
import org.avni.server.web.request.PointRequest;
import org.avni.server.web.request.ProgramEncounterRequest;
import org.avni.server.web.request.ProgramEncountersContract;
import org.avni.server.web.request.rules.RulesContractWrapper.Decision;
import org.avni.server.web.request.rules.RulesContractWrapper.Decisions;
import org.avni.server.web.request.rules.RulesContractWrapper.VisitSchedule;
import org.joda.time.DateTime;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class ProgramEncounterService implements ScopeAwareService {
    private static org.slf4j.Logger logger = LoggerFactory.getLogger(ProgramEncounterService.class);
    @Autowired
    Bugsnag bugsnag;
    private ProgramEncounterRepository programEncounterRepository;
    private EncounterTypeRepository encounterTypeRepository;
    private OperationalEncounterTypeRepository operationalEncounterTypeRepository;
    private ObservationService observationService;
    private ProgramEnrolmentRepository programEnrolmentRepository;
    private FormMappingRepository formMappingRepository;
    private EncounterService encounterService;

    @Autowired
    public ProgramEncounterService(ProgramEncounterRepository programEncounterRepository, EncounterTypeRepository encounterTypeRepository, OperationalEncounterTypeRepository operationalEncounterTypeRepository, ObservationService observationService, ProgramEnrolmentRepository programEnrolmentRepository, FormMappingRepository formMappingRepository, EncounterService encounterService) {
        this.programEncounterRepository = programEncounterRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.operationalEncounterTypeRepository = operationalEncounterTypeRepository;
        this.observationService = observationService;
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.formMappingRepository = formMappingRepository;
        this.encounterService = encounterService;
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
        programEncountersContract.setSubjectUUID(programEncounter.getProgramEnrolment().getIndividual().getUuid());
        programEncountersContract.setEncounterDateTime(programEncounter.getEncounterDateTime());
        programEncountersContract.setCancelDateTime(programEncounter.getCancelDateTime());
        programEncountersContract.setEarliestVisitDateTime(programEncounter.getEarliestVisitDateTime());
        programEncountersContract.setMaxVisitDateTime(programEncounter.getMaxVisitDateTime());
        programEncountersContract.setVoided(programEncounter.isVoided());
        programEncountersContract.setEnrolmentUUID(programEncounter.getProgramEnrolment().getUuid());
        if (programEncounter.getObservations() != null) {
            programEncountersContract.setObservations(observationService.constructObservations(programEncounter.getObservations()));
        }
        if (programEncounter.getCancelObservations() != null) {
            programEncountersContract.setCancelObservations(observationService.constructObservations(programEncounter.getCancelObservations()));
        }
        return programEncountersContract;
    }

    public List<ProgramEncounter> scheduledEncountersByType(ProgramEnrolment programEnrolment, String encounterTypeName, String currentProgramEncounterUuid) {
        Stream<ProgramEncounter> scheduledEncounters = programEnrolment.scheduledEncountersOfType(encounterTypeName).filter(enc -> !enc.getUuid().equals(currentProgramEncounterUuid));
        return scheduledEncounters.collect(Collectors.toList());
    }

    public void saveVisitSchedules(String programEnrolmentUuid, List<VisitSchedule> visitSchedules, String currentProgramEncounterUuid) {
        ProgramEnrolment programEnrolment = programEnrolmentRepository.findByUuid(programEnrolmentUuid);
        for (VisitSchedule visitSchedule : visitSchedules) {
            saveVisitSchedule(programEnrolment, visitSchedule, currentProgramEncounterUuid);
        }
    }

    public void saveVisitSchedule(ProgramEnrolment programEnrolment, VisitSchedule visitSchedule, String currentProgramEncounterUuid) {
        List<ProgramEncounter> allScheduleEncountersByType = scheduledEncountersByType(programEnrolment, visitSchedule.getEncounterType(), currentProgramEncounterUuid);
        if (allScheduleEncountersByType.isEmpty() || "createNew".equals(visitSchedule.getVisitCreationStrategy())) {
            OperationalEncounterType operationalEncounterType = operationalEncounterTypeRepository.findByName(visitSchedule.getEncounterType());
            if (operationalEncounterType == null) {
                EncounterType encounterType = encounterTypeRepository.findByName(visitSchedule.getEncounterType());
                if (encounterType == null) {
                    throw new BadRequestError("Next scheduled visit is for encounter type=%s that doesn't exist", visitSchedule.getEncounterType());
                } else {
                    operationalEncounterType = encounterType.getOperationalEncounterTypes().stream().findFirst().orElse(null);
                    if (operationalEncounterType == null) {
                        throw new BadRequestError("Next scheduled visit is for encounter type=%s that doesn't exist", visitSchedule.getEncounterType());
                    }
                }
            }
            ProgramEncounter programEncounter = createEmptyProgramEncounter(programEnrolment, operationalEncounterType);
            allScheduleEncountersByType = Arrays.asList(programEncounter);
        }
        allScheduleEncountersByType.stream().forEach(programEncounter -> {
            updateProgramEncounterWithVisitSchedule(programEncounter, visitSchedule);
            programEncounter.setProgramEnrolment(programEnrolment);
            this.save(programEncounter);
        });
    }

    public void updateProgramEncounterWithVisitSchedule(ProgramEncounter programEncounter, VisitSchedule visitSchedule) {
        programEncounter.setEarliestVisitDateTime(visitSchedule.getEarliestDate());
        programEncounter.setMaxVisitDateTime(visitSchedule.getMaxDate());
        programEncounter.setName(visitSchedule.getName());
    }

    public ProgramEncounter createEmptyProgramEncounter(ProgramEnrolment programEnrolment, OperationalEncounterType operationalEncounterType) {
        ProgramEncounter programEncounter = new ProgramEncounter();
        programEncounter.setEncounterType(operationalEncounterType.getEncounterType());
        programEncounter.setProgramEnrolment(programEnrolment);
        programEncounter.setEncounterDateTime(null);
        programEncounter.setUuid(UUID.randomUUID().toString());
        programEncounter.setVoided(false);
        programEncounter.setObservations(new ObservationCollection());
        programEncounter.setCancelObservations(new ObservationCollection());
        return programEncounter;
    }

    public void saveProgramEncounter(ProgramEncounterRequest request) {
        logger.info(String.format("Saving programEncounter with uuid %s", request.getUuid()));
        checkForSchedulingCompleteConstraintViolation(request);
        EncounterType encounterType = encounterTypeRepository.findByUuidOrName(request.getEncounterType(), request.getEncounterTypeUUID());
        ProgramEncounter encounter = EntityHelper.newOrExistingEntity(programEncounterRepository, request, new ProgramEncounter());
        //Planned visit can not overwrite completed encounter
        if (encounter.isCompleted() && request.isPlanned())
            return;

        encounter.setEncounterDateTime(request.getEncounterDateTime());
        ProgramEnrolment programEnrolment = programEnrolmentRepository.findByUuid(request.getProgramEnrolmentUUID());
        encounter.setProgramEnrolment(programEnrolment);
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

        Decisions decisions = request.getDecisions();
        if (decisions != null) {
            ObservationCollection observationsFromDecisions = observationService
                    .createObservationsFromDecisions(decisions.getEncounterDecisions());
            if (decisions.isCancel()) {
                encounter.getCancelObservations().putAll(observationsFromDecisions);
            } else {
                encounter.getObservations().putAll(observationsFromDecisions);
            }
            List<Decision> enrolmentDecisions = decisions.getEnrolmentDecisions();
            if (enrolmentDecisions != null) {
                ObservationCollection enrolmentObservations = observationService.createObservationsFromDecisions(enrolmentDecisions);
                programEnrolment.getObservations().putAll(enrolmentObservations);
            }

        }
        this.save(encounter);
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

    @Override
    public boolean isScopeEntityChanged(DateTime lastModifiedDateTime, String encounterTypeUUID) {
        return true;
//        EncounterType encounterType = encounterTypeRepository.findByUuid(encounterTypeUUID);
//        FormMapping formMapping = formMappingRepository.getAllProgramEncounterFormMappings()
//                .stream()
//                .filter(fm -> fm.getEncounterTypeUuid().equals(encounterTypeUUID))
//                .findFirst()
//                .orElse(null);
//        User user = UserContextHolder.getUserContext().getUser();
//        return encounterType != null &&
//                formMapping != null &&
//                isChanged(user, lastModifiedDateTime, encounterType.getId(), formMapping.getSubjectType());
    }

    @Override
    public OperatingIndividualScopeAwareRepository repository() {
        return programEncounterRepository;
    }

    public ProgramEncounter save(ProgramEncounter programEncounter) {
        ProgramEnrolment programEnrolment = programEncounter.getProgramEnrolment();
        Individual individual = programEnrolment.getIndividual();
        programEncounter.addConceptSyncAttributeValues(individual.getSubjectType(), individual.getObservations());
        programEncounter.setIndividual(individual);
        if (individual.getAddressLevel() != null) {
            programEncounter.setAddressId(individual.getAddressLevel().getId());
        }
        return programEncounterRepository.save(programEncounter);
    }

}
