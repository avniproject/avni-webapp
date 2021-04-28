package org.openchs.web.api;

import org.joda.time.DateTime;
import org.openchs.dao.*;
import org.openchs.domain.Individual;
import org.openchs.domain.Program;
import org.openchs.domain.ProgramEnrolment;
import org.openchs.service.ConceptService;
import org.openchs.util.S;
import org.openchs.web.request.api.ApiProgramEnrolmentRequest;
import org.openchs.web.request.api.RequestUtils;
import org.openchs.web.response.ProgramEnrolmentResponse;
import org.openchs.web.response.ResponsePage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.ArrayList;

@RestController
public class ProgramEnrolmentApiController {
    private final ProgramEnrolmentRepository programEnrolmentRepository;
    private final ConceptRepository conceptRepository;
    private final ConceptService conceptService;
    private final IndividualRepository individualRepository;
    private final ProgramRepository programRepository;

    @Autowired
    public ProgramEnrolmentApiController(ProgramEnrolmentRepository programEnrolmentRepository, ConceptRepository conceptRepository, ConceptService conceptService, IndividualRepository individualRepository, ProgramRepository programRepository) {
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.conceptRepository = conceptRepository;
        this.conceptService = conceptService;
        this.individualRepository = individualRepository;
        this.programRepository = programRepository;
    }

    @PostMapping(value = "/api/programEnrolment")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    @ResponseBody
    public ResponseEntity<ProgramEnrolmentResponse> post(@RequestBody ApiProgramEnrolmentRequest request) {
        ProgramEnrolment encounter = new ProgramEnrolment();
        encounter.assignUUID();
        updateEnrolment(encounter, request);
        return new ResponseEntity<>(ProgramEnrolmentResponse.fromProgramEnrolment(encounter, conceptRepository, conceptService), HttpStatus.OK);
    }

    @PutMapping(value = "/api/programEnrolment/{id}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    @ResponseBody
    public ResponseEntity<ProgramEnrolmentResponse> put(@PathVariable String id, @RequestBody ApiProgramEnrolmentRequest request) {
        ProgramEnrolment programEnrolment = programEnrolmentRepository.findByUuid(id);
        if (programEnrolment == null) {
            throw new IllegalArgumentException(String.format("Encounter not found with id '%s'", id));
        }
        updateEnrolment(programEnrolment, request);
        return new ResponseEntity<>(ProgramEnrolmentResponse.fromProgramEnrolment(programEnrolment, conceptRepository, conceptService), HttpStatus.OK);
    }

    private void updateEnrolment(ProgramEnrolment enrolment, ApiProgramEnrolmentRequest request) {
        Individual subject = individualRepository.findByUuid(request.getSubjectUuid());
        if (subject == null) {
            throw new IllegalArgumentException(String.format("Subject not found with UUID '%s'", request.getSubjectUuid()));
        }

        Program program = programRepository.findByName(request.getProgram());
        if (program == null) {
            throw new IllegalArgumentException(String.format("Program not found with name '%s'", request.getProgram()));
        }

        enrolment.setProgram(program);
        enrolment.setEnrolmentLocation(request.getEnrolmentLocation());
        enrolment.setExitLocation(request.getExitLocation());
        enrolment.setEnrolmentDateTime(request.getEnrolmentDateTime());
        enrolment.setProgramExitDateTime(request.getExitDateTime());
        enrolment.setIndividual(subject);
        enrolment.setObservations(RequestUtils.createObservations(request.getObservations(), conceptRepository));
        enrolment.setProgramExitObservations(RequestUtils.createObservations(request.getExitObservations(), conceptRepository));
        enrolment.setVoided(request.isVoided());

        programEnrolmentRepository.save(enrolment);
    }

    @RequestMapping(value = "/api/programEnrolments", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public Object getEnrolments(@RequestParam(name = "lastModifiedDateTime", required = false)
                                    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
                                @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
                                @RequestParam(value = "program", required = false) String program,
                                @RequestParam(value = "subject", required = false) String subjectUuid,
                                Pageable pageable) {
        Page<ProgramEnrolment> programEnrolments;
        if (S.isEmpty(program) && lastModifiedDateTime != null) {
            programEnrolments = programEnrolmentRepository.findByAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(lastModifiedDateTime, now, pageable);
        } else if (S.isEmpty(subjectUuid) && lastModifiedDateTime != null) {
            programEnrolments = programEnrolmentRepository.findByAuditLastModifiedDateTimeIsBetweenAndProgramNameOrderByAuditLastModifiedDateTimeAscIdAsc(lastModifiedDateTime, now, program, pageable);
        } else if (!S.isEmpty(subjectUuid) && !S.isEmpty(program)) {
            programEnrolments = programEnrolmentRepository.findByProgramNameAndIndividualUuidOrderByAuditLastModifiedDateTimeAscIdAsc(program, subjectUuid, pageable);
        } else {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        ArrayList<ProgramEnrolmentResponse> programEnrolmentResponses = new ArrayList<>();
        programEnrolments.forEach(programEnrolment -> programEnrolmentResponses.add(ProgramEnrolmentResponse.fromProgramEnrolment(programEnrolment, conceptRepository, conceptService)));
        return new ResponsePage(programEnrolmentResponses, programEnrolments.getNumberOfElements(), programEnrolments.getTotalPages(), programEnrolments.getSize());
    }

    @GetMapping(value = "/api/programEnrolment/{id}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public ResponseEntity<ProgramEnrolmentResponse> get(@PathVariable("id") String uuid) {
        ProgramEnrolment programEnrolment = programEnrolmentRepository.findByUuid(uuid);
        if (programEnrolment == null)
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(ProgramEnrolmentResponse.fromProgramEnrolment(programEnrolment, conceptRepository, conceptService), HttpStatus.OK);
    }
}