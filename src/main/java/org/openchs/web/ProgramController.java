package org.openchs.web;

import org.openchs.dao.ProgramRepository;
import org.openchs.domain.Concept;
import org.openchs.domain.ConceptAnswer;
import org.openchs.domain.ConceptDataType;
import org.openchs.domain.Program;
import org.openchs.web.request.ConceptContract;
import org.openchs.web.request.ProgramRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;
import java.util.HashSet;

@RestController
public class ProgramController {
    private ProgramRepository programRepository;

    @Autowired
    public ProgramController(ProgramRepository programRepository) {
        this.programRepository = programRepository;
    }

    @RequestMapping(value = "/programs", method = RequestMethod.POST)
    @Transactional
    void save(@RequestBody ProgramRequest programRequest) {
            System.out.println(String.format("Creating program: %s", programRequest.toString()));
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