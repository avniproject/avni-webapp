package org.openchs.web;

import org.openchs.dao.*;
import org.openchs.domain.*;
import org.openchs.web.request.ObservationRequest;
import org.openchs.web.request.ProgramEncounterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProgramEncounterController extends AbstractController<ProgramEncounter> {
    private EncounterTypeRepository encounterTypeRepository;
    private ConceptRepository conceptRepository;
    private ProgramEncounterRepository programEncounterRepository;
    private ProgramEnrolmentRepository programEnrolmentRepository;

    @Autowired
    public ProgramEncounterController(EncounterTypeRepository encounterTypeRepository, ConceptRepository conceptRepository, ProgramEncounterRepository programEncounterRepository, ProgramEnrolmentRepository programEnrolmentRepository) {
        this.encounterTypeRepository = encounterTypeRepository;
        this.conceptRepository = conceptRepository;
        this.programEncounterRepository = programEncounterRepository;
        this.programEnrolmentRepository = programEnrolmentRepository;
    }

    @RequestMapping(value = "/programEncounters", method = RequestMethod.POST)
    void save(@RequestBody ProgramEncounterRequest request) {
        EncounterType encounterType = encounterTypeRepository.findByUuid(request.getEncounterTypeUUID());

        ProgramEncounter encounter = newOrExistingEntity(programEncounterRepository, request, new ProgramEncounter());
        encounter.setEncounterDateTime(request.getEncounterDateTime());
        encounter.setProgramEnrolment(programEnrolmentRepository.findByUuid(request.getProgramEnrolmentUUID()));
        encounter.setEncounterType(encounterType);
        encounter.setObservations(EncounterControllerUtil.createObservationCollection(conceptRepository, request));
        encounter.setName(request.getName());
        encounter.setScheduledDateTime(request.getScheduledDateTime());
        encounter.setMaxDateTime(request.getMaxDateTime());

        programEncounterRepository.save(encounter);
    }
}