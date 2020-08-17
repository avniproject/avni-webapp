package org.openchs.service;

import com.bugsnag.Bugsnag;
import org.joda.time.DateTime;
import org.openchs.dao.*;
import org.openchs.domain.*;
import org.openchs.web.request.*;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.springframework.data.jpa.domain.Specifications.where;

@Service
public class EncounterService {
    private static org.slf4j.Logger logger = LoggerFactory.getLogger(EncounterService.class);
    @Autowired
    Bugsnag bugsnag;
    private EncounterRepository encounterRepository;
    private ObservationService observationService;
    private IndividualRepository individualRepository;

    @Autowired
    public EncounterService(EncounterRepository encounterRepository, ObservationService observationService, IndividualRepository individualRepository) {
        this.encounterRepository = encounterRepository;
        this.observationService = observationService;
        this.individualRepository = individualRepository;
    }

    public EncounterContract getEncounterByUuid(String uuid) {
        Encounter encounter = encounterRepository.findByUuid(uuid);
        return constructEncounters(encounter);
    }

    public Page<EncounterContract> getAllCompletedEncounters(String uuid, String encounterTypeUuids, DateTime encounterDateTime, DateTime earliestVisitDateTime, Pageable pageable){
        Page<EncounterContract> encountersContract = null;
        List<String> encounterTypeIdList = new ArrayList<>();
        if(encounterTypeUuids != null) {
            encounterTypeIdList = Arrays.asList(encounterTypeUuids.split(","));
        }
        Individual individual = individualRepository.findByUuid(uuid);
        Specification<Encounter> completedEncounterSpecification = Specification.where(encounterRepository.withNotNullEncounterDateTime())
                .or(encounterRepository.withNotNullCancelDateTime());
        encountersContract = encounterRepository.findAll(
                where(encounterRepository.withIndividualId(individual.getId()))
                        .and(encounterRepository.withEncounterTypeIdUuids(encounterTypeIdList))
                        .and(encounterRepository.withEncounterEarliestVisitDateTime(earliestVisitDateTime))
                        .and(encounterRepository.withEncounterDateTime(encounterDateTime))
                        .and(completedEncounterSpecification)
                ,pageable).map(encounter -> constructEncounters(encounter));
        return encountersContract;
    }

    public EncounterContract constructEncounters(Encounter encounter) {
            EncounterContract encountersContract = new EncounterContract();
            EncounterTypeContract encounterTypeContract = new EncounterTypeContract();
            encounterTypeContract.setName(encounter.getEncounterType().getName());
            encounterTypeContract.setUuid(encounter.getEncounterType().getUuid());
            encounterTypeContract.setEncounterEligibilityCheckRule(encounter.getEncounterType().getEncounterEligibilityCheckRule());
            encountersContract.setUuid(encounter.getUuid());
            encountersContract.setName(encounter.getName());
            encountersContract.setEncounterType(encounterTypeContract);
            encountersContract.setSubjectUUID(encounter.getIndividual().getUuid());
            encountersContract.setEncounterDateTime(encounter.getEncounterDateTime());
            encountersContract.setCancelDateTime(encounter.getCancelDateTime());
            encountersContract.setEarliestVisitDateTime(encounter.getEarliestVisitDateTime());
            encountersContract.setMaxVisitDateTime(encounter.getMaxVisitDateTime());
            encountersContract.setVoided(encounter.isVoided());
            if(encounter.getObservations() != null) {
                encountersContract.setObservations(observationService.constructObservations(encounter.getObservations()));
            }
            if(encounter.getCancelObservations() != null) {
                encountersContract.setCancelObservations(observationService.constructObservations(encounter.getCancelObservations()));
            }
        return  encountersContract;
    }
}
