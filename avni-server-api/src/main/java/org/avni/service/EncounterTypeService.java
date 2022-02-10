package org.avni.service;

import org.avni.application.FormMapping;
import org.avni.dao.EncounterTypeRepository;
import org.avni.dao.OperationalEncounterTypeRepository;
import org.avni.dao.application.FormMappingRepository;
import org.avni.domain.EncounterType;
import org.avni.domain.OperationalEncounterType;
import org.avni.domain.Organisation;
import org.avni.web.request.EncounterTypeContract;
import org.avni.web.request.OperationalEncounterTypeContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.joda.time.DateTime;
import java.util.stream.Stream;

@Service
public class EncounterTypeService implements NonScopeAwareService {

    private final Logger logger;
    private final OperationalEncounterTypeRepository operationalEncounterTypeRepository;
    private EncounterTypeRepository encounterTypeRepository;
    private FormMappingRepository formMappingRepository;

    @Autowired
    public EncounterTypeService(EncounterTypeRepository encounterTypeRepository, OperationalEncounterTypeRepository operationalEncounterTypeRepository, FormMappingRepository formMappingRepository) {
        this.encounterTypeRepository = encounterTypeRepository;
        this.operationalEncounterTypeRepository = operationalEncounterTypeRepository;
        this.formMappingRepository = formMappingRepository;
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
        encounterType.setActive(encounterTypeRequest.getActive());
        encounterType.setEncounterEligibilityCheckDeclarativeRule(encounterTypeRequest.getEncounterEligibilityCheckDeclarativeRule());
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

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return encounterTypeRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }

    public Stream<EncounterType> getAllGeneralEncounter() {
        return formMappingRepository.findByProgramNullAndEncounterTypeNotNullAndIsVoidedFalse().stream().map(FormMapping::getEncounterType);
    }

    public Stream<EncounterType> getAllProgramEncounter() {
        return formMappingRepository.findByProgramNotNullAndEncounterTypeNotNullAndIsVoidedFalse().stream().map(FormMapping::getEncounterType);
    }
}
