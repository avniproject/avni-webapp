package org.openchs.web;

import org.openchs.dao.*;
import org.openchs.domain.*;
import org.openchs.web.request.AddressLevelContract;
import org.openchs.web.request.CatchmentContract;
import org.openchs.web.request.OperationalModulesContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
public class OperationalModulesController {
    private final Logger logger;
    private final OperationalEncounterTypeRepository operationalEncounterTypeRepository;
    private final OperationalProgramRepository operationalProgramRepository;
    private final ProgramRepository programRepository;
    private final EncounterTypeRepository encounterTypeRepository;
    private OrganisationRepository organisationRepository;

    @Autowired
    public OperationalModulesController(OperationalEncounterTypeRepository operationalEncounterTypeRepository, OperationalProgramRepository operationalProgramRepository, ProgramRepository programRepository, EncounterTypeRepository encounterTypeRepository, OrganisationRepository organisationRepository) {
        this.operationalEncounterTypeRepository = operationalEncounterTypeRepository;
        this.operationalProgramRepository = operationalProgramRepository;
        this.programRepository = programRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.organisationRepository = organisationRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/operationalModules", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    @Transactional
    void save(@RequestBody OperationalModulesContract request) {
        Organisation organisation = organisationRepository.findByName(request.getOrganisationName());
        request.getPrograms().forEach(programName -> {
            operationalProgramRepository.save(createOperationalProgram(programName, organisation));
        });
        request.getEncounterTypes().forEach(s -> operationalEncounterTypeRepository.save(createOperationalEncounterType(s, organisation)));
    }

    private OperationalProgram createOperationalProgram(String programName, Organisation organisation) {
        Program program = programRepository.findByName(programName);
        OperationalProgram operationalProgram = operationalProgramRepository.findByProgramAndOrganisationId(program, organisation.getId());
        if (operationalProgram != null) return operationalProgram;
        if (program == null){
            logger.info(String.format("Program not found for name: %s", programName));
        }

        operationalProgram = new OperationalProgram();
        operationalProgram.setProgram(program);
        operationalProgram.setOrganisationId(organisation.getId());
        operationalProgram.setUuid(UUID.randomUUID().toString());
        operationalProgramRepository.save(operationalProgram);
        return operationalProgram;
    }

    private OperationalEncounterType createOperationalEncounterType(String encounterTypeName, Organisation organisation) {
        EncounterType encounterType = encounterTypeRepository.findByNameAndVoidedFalse(encounterTypeName);
        OperationalEncounterType operationalEncounterType = operationalEncounterTypeRepository.findByEncounterTypeAndOrganisationId(encounterType, organisation.getId());
        if (operationalEncounterType != null) return operationalEncounterType;

        operationalEncounterType = new OperationalEncounterType();
        operationalEncounterType.setUuid(UUID.randomUUID().toString());
        operationalEncounterType.setEncounterType(encounterType);
        operationalEncounterType.setOrganisationId(organisation.getId());
        operationalEncounterTypeRepository.save(operationalEncounterType);
        return operationalEncounterType;
    }
}
