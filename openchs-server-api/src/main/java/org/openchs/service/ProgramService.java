package org.openchs.service;

import org.openchs.dao.OperationalProgramRepository;
import org.openchs.dao.ProgramRepository;
import org.openchs.domain.OperationalProgram;
import org.openchs.domain.Organisation;
import org.openchs.domain.Program;
import org.openchs.web.request.OperationalProgramContract;
import org.openchs.web.request.ProgramRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProgramService {
    private final Logger logger;
    private ProgramRepository programRepository;
    private OperationalProgramRepository operationalProgramRepository;

    @Autowired
    public ProgramService(ProgramRepository programRepository, OperationalProgramRepository operationalProgramRepository) {
        this.programRepository = programRepository;
        this.operationalProgramRepository = operationalProgramRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    public void saveProgram(ProgramRequest programRequest) {
        logger.info(String.format("Creating program: %s", programRequest.toString()));
        Program program = programRepository.findByUuid(programRequest.getUuid());
        if (program == null) {
            program = createProgram(programRequest);
        }
        program.setName(programRequest.getName());
        program.setColour(programRequest.getColour());
        program.setEnrolmentSummaryRule(programRequest.getEnrolmentSummaryRule());
        program.setChecklistsRule(program.getChecklistsRule());
        program.setEnrolmentEligibilityCheckRule(program.getEnrolmentEligibilityCheckRule());
        programRepository.save(program);
    }

    public void createOperationalProgram(OperationalProgramContract operationalProgramContract, Organisation organisation) {
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

    private Program createProgram(ProgramRequest programRequest) {
        Program program = new Program();
        program.setUuid(programRequest.getUuid());
        return program;
    }
}
