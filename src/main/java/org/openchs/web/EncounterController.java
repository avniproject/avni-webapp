package org.openchs.web;

import org.openchs.dao.ConceptRepository;
import org.openchs.dao.EncounterRepository;
import org.openchs.dao.EncounterTypeRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.domain.Encounter;
import org.openchs.domain.EncounterType;
import org.openchs.domain.Individual;
import org.openchs.web.request.EncounterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EncounterController extends AbstractController<Encounter> {
    private final IndividualRepository individualRepository;
    private final EncounterTypeRepository encounterTypeRepository;
    private final ConceptRepository conceptRepository;
    private final EncounterRepository encounterRepository;

    @Autowired
    public EncounterController(IndividualRepository individualRepository, EncounterTypeRepository encounterTypeRepository, ConceptRepository conceptRepository, EncounterRepository encounterRepository) {
        this.individualRepository = individualRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.conceptRepository = conceptRepository;
        this.encounterRepository = encounterRepository;
    }

    @RequestMapping(value = "/encounters", method = RequestMethod.POST)
    void save(@RequestBody EncounterRequest encounterRequest) {
        EncounterType encounterType = encounterTypeRepository.findByUuid(encounterRequest.getEncounterTypeUUID());
        Individual individual = individualRepository.findByUuid(encounterRequest.getIndividualUUID());

        Encounter encounter = newOrExistingEntity(encounterRepository, encounterRequest, new Encounter());
        encounter.setEncounterDateTime(encounterRequest.getEncounterDateTime());
        encounter.setIndividual(individual);
        encounter.setEncounterType(encounterType);
        encounter.setObservations(EncounterControllerUtil.createObservationCollection(conceptRepository, encounterRequest));
        encounterRepository.save(encounter);
    }
}