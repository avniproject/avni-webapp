package org.openchs.web;

import org.openchs.dao.OperationalProgramRepository;
import org.openchs.dao.OrganisationRepository;
import org.openchs.dao.ProgramRepository;
import org.openchs.domain.OperationalProgram;
import org.openchs.domain.Organisation;
import org.openchs.domain.Program;
import org.openchs.web.request.OperationalProgramContract;
import org.openchs.web.request.OperationalProgramsContract;
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
public class OperationalProgramsController {
    private final OperationalProgramRepository operationalProgramRepository;
    private final ProgramRepository programRepository;
    private final OrganisationRepository organisationRepository;
    private final Logger logger;

    @Autowired
    public OperationalProgramsController(OperationalProgramRepository operationalProgramRepository, ProgramRepository programRepository, OrganisationRepository organisationRepository) {
        this.operationalProgramRepository = operationalProgramRepository;
        this.programRepository = programRepository;
        this.organisationRepository = organisationRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/operationalPrograms", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    void saveOperationalPrograms(@RequestBody OperationalProgramsContract request) {
        Organisation organisation = organisationRepository.findByName(request.getOrganisationName());
        request.getOperationalPrograms().forEach(operationalProgramContract -> {
            createOperationalProgram(operationalProgramContract, organisation);
        });
    }

    private void createOperationalProgram(OperationalProgramContract operationalProgramContract, Organisation organisation) {
        String programUuid = operationalProgramContract.getProgram().getUuid();
        Program program = programRepository.findByUuid(programUuid);
        if (program == null) {
            logger.info(String.format("Program not found for uuid: '%s'", programUuid));
            return;
        }

        OperationalProgram operationalProgram = operationalProgramRepository.findByUuid(operationalProgramContract.getUuid());

        if (operationalProgram == null) { /* backward compatibility with old data created by old contract w/o uuid */
            operationalProgram = operationalProgramRepository.findByProgramAndOrganisationId(program, organisation.getId());
        }

        if (operationalProgram == null) {
            operationalProgram = new OperationalProgram();
        }

        operationalProgram.setUuid(operationalProgramContract.getUuid());
        operationalProgram.setName(operationalProgramContract.getName());
        operationalProgram.setProgram(program);
        operationalProgram.setOrganisationId(organisation.getId());
        operationalProgram.setVoided(operationalProgramContract.isVoided());
        operationalProgram.setProgramSubjectLabel(operationalProgramContract.getProgramSubjectLabel());
        operationalProgramRepository.save(operationalProgram);
    }
}