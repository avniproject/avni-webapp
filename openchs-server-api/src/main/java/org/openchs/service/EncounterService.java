package org.openchs.service;

import com.bugsnag.Bugsnag;
import org.joda.time.DateTime;
import org.openchs.common.EntityHelper;
import org.openchs.dao.*;
import org.openchs.dao.individualRelationship.RuleFailureLogRepository;
import org.openchs.domain.*;
import org.openchs.geo.Point;
import org.openchs.web.request.*;
import org.openchs.web.request.rules.RulesContractWrapper.VisitSchedule;
import org.openchs.web.request.rules.constant.EntityEnum;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.springframework.data.jpa.domain.Specifications.where;

@Service
public class EncounterService {
    private static org.slf4j.Logger logger = LoggerFactory.getLogger(EncounterService.class);
    @Autowired
    Bugsnag bugsnag;
    private EncounterRepository encounterRepository;
    private IndividualService individualService;
    private IndividualRepository individualRepository;

    @Autowired
    public EncounterService(EncounterRepository encounterRepository, IndividualService individualService, IndividualRepository individualRepository) {
        this.encounterRepository = encounterRepository;
        this.individualService = individualService;
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
        encountersContract = encounterRepository.findAll(
                where(encounterRepository.withProgramEncounterId(individual.getId()))
                        .and(encounterRepository.withProgramEncounterTypeIdUuids(encounterTypeIdList))
                        .and(encounterRepository.withProgramEncounterEarliestVisitDateTime(earliestVisitDateTime))
                        .and(encounterRepository.withProgramEncounterDateTime(encounterDateTime))
                        .and(encounterRepository.withNotNullEncounterDateTime())
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
                encountersContract.setObservations(individualService.constructObservations(encounter.getObservations()));
            }
            if(encounter.getCancelObservations() != null) {
                encountersContract.setCancelObservations(individualService.constructObservations(encounter.getCancelObservations()));
            }
        return  encountersContract;
    }
}