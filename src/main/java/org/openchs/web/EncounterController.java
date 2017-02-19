package org.openchs.web;

import org.openchs.dao.ConceptRepository;
import org.openchs.dao.EncounterRepository;
import org.openchs.dao.EncounterTypeRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.domain.*;
import org.openchs.web.request.EncounterRequest;
import org.openchs.web.request.ObservationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EncounterController extends AbstractController<Encounter> {
    @Autowired
    private IndividualRepository individualRepository;
    @Autowired
    private EncounterTypeRepository encounterTypeRepository;
    @Autowired
    private ConceptRepository conceptRepository;
    @Autowired
    private EncounterRepository encounterRepository;

    @RequestMapping(value = "/encounters", method = RequestMethod.POST)
    void save(@RequestBody EncounterRequest encounterRequest) {
        EncounterType encounterType = encounterTypeRepository.findByUuid(encounterRequest.getEncounterTypeUUID());
        Individual individual = individualRepository.findByUuid(encounterRequest.getIndividualUUID());

        Encounter encounter = newOrExistingEntity(encounterRepository, encounterRequest, new Encounter());
        encounter.setEncounterDateTime(encounterRequest.getEncounterDateTime());
        encounter.setIndividual(individual);
        encounter.setEncounterType(encounterType);

        ObservationCollection observations = new ObservationCollection();
        for (ObservationRequest observationRequest : encounterRequest.getObservations()) {
            Observation observation = new Observation();

            if (conceptRepository.findByUuid(observationRequest.getConceptUUID()) == null) {
                throw new RuntimeException(String.format("Concept with uuid: %s not found", observationRequest.getConceptUUID()));
            }

            observation.setConceptUUID(observationRequest.getConceptUUID());
            observation.setValuePrimitive(observationRequest.getValuePrimitive());
            observation.setValueCoded(observationRequest.getValueCoded());
            observations.add(observation);
        }
        encounter.setObservations(observations);

        encounterRepository.save(encounter);
    }
}