package org.openchs.importer.batch.csv.creator;

import org.openchs.dao.ProgramRepository;
import org.openchs.domain.Program;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ProgramCreator {

    private ProgramRepository programRepository;

    @Autowired
    public ProgramCreator(ProgramRepository programRepository) {
        this.programRepository = programRepository;
    }

    public Program getProgram(String name, List<String> errorMsgs, String identifierForErrorMessage) {
        Program program = programRepository.findByName(name);
        if (program == null) {
            errorMsgs.add(String.format("'%s' is required", identifierForErrorMessage));
        }
        return program;
    }
}
