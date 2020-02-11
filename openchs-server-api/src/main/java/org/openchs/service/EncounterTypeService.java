package org.openchs.service;

import org.openchs.dao.EncounterTypeRepository;
import org.openchs.dao.OperationalEncounterTypeRepository;
import org.openchs.domain.EncounterType;
import org.openchs.domain.OperationalEncounterType;
import org.openchs.domain.Organisation;
import org.openchs.web.request.EncounterTypeContract;
import org.openchs.web.request.OperationalEncounterTypeContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EncounterTypeService {

    private final Logger logger;
    private final OperationalEncounterTypeRepository operationalEncounterTypeRepository;
    private EncounterTypeRepository encounterTypeRepository;

    @Autowired
    public EncounterTypeService(EncounterTypeRepository encounterTypeRepository, OperationalEncounterTypeRepository operationalEncounterTypeRepository) {
        this.encounterTypeRepository = encounterTypeRepository;
        this.operationalEncounterTypeRepository = operationalEncounterTypeRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    public void createEncounterType(EncounterTypeContract encounterTypeRequest) {
        EncounterType encounterType = encounterTypeRepository.findByUuid(encounterTypeRequest.getUuid());
        if (encounterType == null) {
            encounterType = new EncounterType();
            encounterType.setUuid(encounterTypeRequest.getUuid());
        }
        encounterType.setName(encounterTypeRequest.getName());
        encounterType.setEncounterEligibilityCheckRule(encounterTypeRequest.getEncounterEligibilityCheckRule());
        encounterType.setVoided(encounterTypeRequest.isVoided());
        encounterTypeRepository.save(encounterType);
    }

    public void createOperationalEncounterType(OperationalEncounterTypeContract operationalEncounterTypeContract, Organisation organisation) {
        String encounterTypeUuid = operationalEncounterTypeContract.getEncounterType().getUuid();
        EncounterType encounterType = encounterTypeRepository.findByUuid(encounterTypeUuid);
        if (encounterType == null) {
            logger.info(String.format("EncounterType not found for uuid: '%s'", encounterTypeUuid));
        }

        OperationalEncounterType operationalEncounterType = operationalEncounterTypeRepository.findByUuid(operationalEncounterTypeContract.getUuid());

        if (operationalEncounterType == null) { /* backward compatibility with old data created by old contract w/o uuid */
            operationalEncounterType = operationalEncounterTypeRepository.findByEncounterTypeAndOrganisationId(encounterType, organisation.getId());
        }

        if (operationalEncounterType == null) {
            operationalEncounterType = new OperationalEncounterType();
        }

        operationalEncounterType.setUuid(operationalEncounterTypeContract.getUuid());
        operationalEncounterType.setName(operationalEncounterTypeContract.getName());
        operationalEncounterType.setEncounterType(encounterType);
        operationalEncounterType.setOrganisationId(organisation.getId());
        operationalEncounterType.setVoided(operationalEncounterTypeContract.isVoided());
        operationalEncounterTypeRepository.save(operationalEncounterType);
    }
}
