package org.avni.importer.batch.csv.creator;

import org.avni.dao.ProgramRepository;
import org.avni.domain.Program;
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

    public Program getProgram(String name, String header) throws Exception {
        Program program = programRepository.findByName(name);
        if (program == null) {
            throw new Exception(String.format("'%s' '%s' not found", header, name));
        }
        return program;
    }
}
