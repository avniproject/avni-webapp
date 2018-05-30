package org.openchs.web;

import org.openchs.dao.EncounterRepository;
import org.openchs.dao.EncounterTypeRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.domain.Encounter;
import org.openchs.domain.EncounterType;
import org.openchs.domain.Individual;
import org.openchs.web.request.EncounterRequest;
import org.openchs.service.ObservationService;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;

@RestController
public class EncounterController extends AbstractController<Encounter> {
    private final IndividualRepository individualRepository;
    private final EncounterTypeRepository encounterTypeRepository;
    private final EncounterRepository encounterRepository;
    private ObservationService observationService;

    private static org.slf4j.Logger logger = LoggerFactory.getLogger(IndividualController.class);

    @Autowired
    public EncounterController(IndividualRepository individualRepository, EncounterTypeRepository encounterTypeRepository, EncounterRepository encounterRepository, ObservationService observationService) {
        this.individualRepository = individualRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.encounterRepository = encounterRepository;
        this.observationService = observationService;
    }

    @RequestMapping(value = "/encounters", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
    public void save(@RequestBody EncounterRequest encounterRequest) {
        logger.info("Saving encounter with uuid %s", encounterRequest.getUuid());

        EncounterType encounterType;
        if (encounterRequest.getEncounterTypeUUID() == null) {
            encounterType = encounterTypeRepository.findByName(encounterRequest.getEncounterType());
        } else {
            encounterType = encounterTypeRepository.findByUuid(encounterRequest.getEncounterTypeUUID());
        }
        Individual individual = individualRepository.findByUuid(encounterRequest.getIndividualUUID());

        Encounter encounter = newOrExistingEntity(encounterRepository, encounterRequest, new Encounter());
        encounter.setEncounterDateTime(encounterRequest.getEncounterDateTime());
        encounter.setIndividual(individual);
        encounter.setEncounterType(encounterType);
        encounter.setObservations(observationService.createObservations(encounterRequest.getObservations()));
        encounter.setVoided(encounterRequest.isVoided());
        encounterRepository.save(encounter);

        logger.info("Saved encounter with uuid %s", encounterRequest.getUuid());
    }
}