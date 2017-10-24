package org.openchs.web;

import org.openchs.dao.ProgramRepository;
import org.openchs.domain.Program;
import org.openchs.web.request.ProgramRequest;
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
public class ProgramController {
    private final Logger logger;
    private ProgramRepository programRepository;

    @Autowired
    public ProgramController(ProgramRepository programRepository) {
        this.programRepository = programRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/programs", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
    public void save(@RequestBody ProgramRequest programRequest) {
        logger.info(String.format("Creating program: %s", programRequest.toString()));
        if (programExistsWithSameNameAndDifferentUUID(programRequest)) {
            throw new RuntimeException(String.format("Program %s exists with different uuid", programRequest.getName()));
        }

        Program program = programRepository.findByUuid(programRequest.getUuid());
        if (program == null) {
            program = createProgram(programRequest);
        }

        program.setName(programRequest.getName());
        program.setColour(programRequest.getColour());

        programRepository.save(program);
    }

    private Program createProgram(ProgramRequest programRequest) {
        Program program = new Program();
        program.setUuid(programRequest.getUuid());
        return program;
    }

    private boolean programExistsWithSameNameAndDifferentUUID(ProgramRequest programRequest) {
        Program program = programRepository.findByName(programRequest.getName());
        return program != null && !program.getUuid().equals(programRequest.getUuid());
    }
}