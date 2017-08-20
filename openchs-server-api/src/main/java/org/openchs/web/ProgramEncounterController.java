package org.openchs.web;

import org.openchs.dao.*;
import org.openchs.domain.*;
import org.openchs.web.request.ObservationService;
import org.openchs.web.request.ProgramEncounterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;

@RestController
public class ProgramEncounterController extends AbstractController<ProgramEncounter> {
    private EncounterTypeRepository encounterTypeRepository;
    private ProgramEncounterRepository programEncounterRepository;
    private ProgramEnrolmentRepository programEnrolmentRepository;
    private ObservationService observationService;

    @Autowired
    public ProgramEncounterController(EncounterTypeRepository encounterTypeRepository, ProgramEncounterRepository programEncounterRepository, ProgramEnrolmentRepository programEnrolmentRepository, ObservationService observationService) {
        this.encounterTypeRepository = encounterTypeRepository;
        this.programEncounterRepository = programEncounterRepository;
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.observationService = observationService;
    }

    @RequestMapping(value = "/programEncounters", method = RequestMethod.POST)
    @Transactional
    void save(@RequestBody ProgramEncounterRequest request) {
        EncounterType encounterType = encounterTypeRepository.findByUuid(request.getEncounterTypeUUID());

        ProgramEncounter encounter = newOrExistingEntity(programEncounterRepository, request, new ProgramEncounter());
        encounter.setEncounterDateTime(request.getEncounterDateTime());
        encounter.setProgramEnrolment(programEnrolmentRepository.findByUuid(request.getProgramEnrolmentUUID()));
        encounter.setEncounterType(encounterType);
        encounter.setObservations(observationService.createObservations(request.getObservations()));
        encounter.setName(request.getName());
        encounter.setScheduledDateTime(request.getScheduledDateTime());
        encounter.setMaxDateTime(request.getMaxDateTime());

        programEncounterRepository.save(encounter);
    }
}