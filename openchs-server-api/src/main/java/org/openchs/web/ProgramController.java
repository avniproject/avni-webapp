package org.openchs.web;

import org.openchs.dao.OperationalProgramRepository;
import org.openchs.dao.ProgramRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.AddressLevelType;
import org.openchs.domain.OperationalProgram;
import org.openchs.domain.Program;
import org.openchs.util.ReactAdminUtil;
import org.openchs.web.request.LocationEditContract;
import org.openchs.web.request.ProgramRequest;
import org.openchs.web.request.webapp.CreateProgram;
import org.openchs.web.request.webapp.UpdateProgram;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;

@RestController
public class ProgramController {
    private final Logger logger;
    private ProgramRepository programRepository;
    private OperationalProgramRepository operationalProgramRepository;

    @Autowired
    public ProgramController(ProgramRepository programRepository, OperationalProgramRepository operationalProgramRepository) {
        this.programRepository = programRepository;
        this.operationalProgramRepository = operationalProgramRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/web/program", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    ResponseEntity<CreateProgram> saveProgram(@RequestBody CreateProgram request) {
        Program program = new Program();
        program.assignUUIDIfRequired();
        program.setName(request.getName());
        program.setColour((request.getColour()));
        programRepository.save(program);
        OperationalProgram operationalProgram = new OperationalProgram();
        operationalProgram.assignUUIDIfRequired();
        operationalProgram.setName(request.getName());
        operationalProgram.setProgramSubjectLabel(request.getProgramSubjectLabel());
        operationalProgram.setProgram(program);
        operationalProgramRepository.save(operationalProgram);
        return new ResponseEntity<>(request, HttpStatus.OK);
    }

    @PutMapping(value = "/web/program/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @Transactional
    public ResponseEntity UpdateProgram(@RequestBody UpdateProgram updateProgram,
                                         @PathVariable("id") Long id) {
        logger.info(String.format("Processing location update request: %s", updateProgram.toString()));

        Program program = null;


        if (updateProgram.getId() != null) {
            program = programRepository.findById(updateProgram.getId());
        }

        if (program == null)
            return ResponseEntity.badRequest()
                    .body(String.format("Program with id '%d' not found", updateProgram.getId()));

        if (updateProgram.getName().trim().equals(""))
            return ResponseEntity.badRequest().body(ReactAdminUtil.generateJsonError("Empty 'name' received"));





        program.setName(updateProgram.getName());
        program.setColour(updateProgram.getColour());
        OperationalProgram operationalProgram = program.getOperationalPrograms().stream().findFirst().orElse(null);
        programRepository.save(program);

        if(operationalProgram!=null){
            operationalProgram.setProgramSubjectLabel(updateProgram.getProgramSubjectLabel());
            operationalProgram.setName(updateProgram.getName());
            operationalProgramRepository.save(operationalProgram);
        }

        return new ResponseEntity<>(program, HttpStatus.OK);
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