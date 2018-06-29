package org.openchs.web;

import org.openchs.dao.*;
import org.openchs.domain.*;
import org.openchs.web.request.OperationalEncounterTypesContract;
import org.openchs.web.request.OperationalEncounterTypeContract;
import org.openchs.web.request.OperationalProgramsContract;
import org.openchs.web.request.OperationalProgramContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;

@RestController
public class OperationalEncounterTypesController {
    private final Logger logger;
    private final OperationalEncounterTypeRepository operationalEncounterTypeRepository;
    private final EncounterTypeRepository encounterTypeRepository;
    private final OrganisationRepository organisationRepository;

    @Autowired
    public OperationalEncounterTypesController(OperationalEncounterTypeRepository operationalEncounterTypeRepository, OperationalProgramRepository operationalProgramRepository, ProgramRepository programRepository, EncounterTypeRepository encounterTypeRepository, OrganisationRepository organisationRepository) {
        this.operationalEncounterTypeRepository = operationalEncounterTypeRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.organisationRepository = organisationRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/operationalEncounterTypes", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    @Transactional
    void saveOperationalEncounterTypes(@RequestBody OperationalEncounterTypesContract request) {
        Organisation organisation = organisationRepository.findByName(request.getOrganisationName());
        request.getOperationalEncounterTypes().forEach(operationalEncounterTypeContract -> {
            createOperationalEncounterType(operationalEncounterTypeContract, organisation);
        });
    }

    private OperationalEncounterType createOperationalEncounterType(OperationalEncounterTypeContract operationalEncounterTypeContract, Organisation organisation) {
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
        return operationalEncounterType;
    }
}
