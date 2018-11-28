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
import java.util.List;

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
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    public void save(@RequestBody List<ProgramRequest> programRequests) {
        programRequests.forEach(programRequest -> {
            logger.info(String.format("Creating program: %s", programRequest.toString()));
            Program program = programRepository.findByUuid(programRequest.getUuid());
            if (program == null) {
                program = createProgram(programRequest);
            }

            program.setName(programRequest.getName());
            program.setColour(programRequest.getColour());

            programRepository.save(program);
        });
    }

    private Program createProgram(ProgramRequest programRequest) {
        Program program = new Program();
        program.setUuid(programRequest.getUuid());
        return program;
    }
}