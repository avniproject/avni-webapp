package org.openchs.web;

import org.openchs.dao.OperationalProgramRepository;
import org.openchs.dao.ProgramRepository;
import org.openchs.domain.OperationalProgram;
import org.openchs.domain.Program;
import org.openchs.util.ReactAdminUtil;
import org.openchs.web.request.ProgramRequest;
import org.openchs.web.request.webapp.ProgramContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;

@RestController
public class ProgramController implements RestControllerResourceProcessor<ProgramContract> {
    private final Logger logger;
    private ProgramRepository programRepository;
    private OperationalProgramRepository operationalProgramRepository;

    @Autowired
    public ProgramController(ProgramRepository programRepository, OperationalProgramRepository operationalProgramRepository) {
        this.programRepository = programRepository;
        this.operationalProgramRepository = operationalProgramRepository;
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

    @PostMapping(value = "/web/program")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    ResponseEntity saveProgramForWeb(@RequestBody ProgramContract request) {
        Program program = new Program();
        program.assignUUIDIfRequired();
        program.setName(request.getName());
        program.setColour(request.getColour());
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
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    public ResponseEntity updateProgramForWeb(@RequestBody ProgramContract programContract,
                                              @PathVariable("id") Long id) {
        logger.info(String.format("Processing Operational Program update request: %s", programContract.toString()));
        if (programContract.getName().trim().equals(""))
            return ResponseEntity.badRequest().body(ReactAdminUtil.generateJsonError("Name can not be empty"));

        OperationalProgram operationalProgram = operationalProgramRepository.findById(id);

        if (operationalProgramRepository == null)
            return ResponseEntity.badRequest()
                    .body(String.format("Operational Program with id '%d' not found", id));

        Program program = operationalProgram.getProgram();

        program.setName(programContract.getName());
        program.setColour(programContract.getColour());
        programRepository.save(program);

        operationalProgram.setProgramSubjectLabel(programContract.getProgramSubjectLabel());
        operationalProgram.setName(programContract.getName());
        operationalProgramRepository.save(operationalProgram);

        return new ResponseEntity<>(program, HttpStatus.OK);
    }

    @GetMapping(value = "/web/program")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public PagedResources<Resource<ProgramContract>> getAll(Pageable pageable) {
        return wrap(operationalProgramRepository.findAll(pageable).map(ProgramContract::fromOperationalProgram));
    }

    @GetMapping(value = "/web/program/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public ProgramContract getOne(@PathVariable("id") Long id) {
        return ProgramContract.fromOperationalProgram(operationalProgramRepository.findById(id));
    }

    private Program createProgram(ProgramRequest programRequest) {
        Program program = new Program();
        program.setUuid(programRequest.getUuid());
        return program;
    }
}