package org.openchs.web;

import org.joda.time.DateTime;
import org.openchs.dao.EncounterRepository;
import org.openchs.dao.EncounterTypeRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.domain.Encounter;
import org.openchs.domain.EncounterType;
import org.openchs.domain.Individual;
import org.openchs.domain.ObservationCollection;
import org.openchs.web.request.EncounterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EncounterController extends AbstractController<Encounter>{

    @Autowired
    private EncounterRepository encounterRepository;

    @Autowired
    private EncounterTypeRepository encounterTypeRepository;

    @Autowired
    private IndividualRepository individualRepository;


    @RequestMapping(value = "/encounters", method = RequestMethod.POST)
    void save(@RequestBody EncounterRequest encounterRequest){

        Encounter encounter = newOrExistingEntity(encounterRepository, encounterRequest, new Encounter());
        encounter.setEncounterDateTime(DateTime.now());

        EncounterType encounterType = encounterTypeRepository.findByUuid(encounterRequest.getEncounterTypeUUID());
        encounter.setEncounterType(encounterType);

        System.out.println(encounterRequest.getIndividualUUID());
        Individual individual = individualRepository.findByUuid(encounterRequest.getIndividualUUID());
        encounter.setIndividual(individual);

        encounter.setObservations(new ObservationCollection());


        encounter.setLastModifiedDateTime(DateTime.now());
        encounterRepository.save(encounter);



    }
}
