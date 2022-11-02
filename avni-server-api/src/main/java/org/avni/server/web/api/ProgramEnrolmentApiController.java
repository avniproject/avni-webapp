package org.avni.server.web.api;

import org.avni.server.dao.ConceptRepository;
import org.avni.server.dao.IndividualRepository;
import org.avni.server.dao.ProgramEnrolmentRepository;
import org.avni.server.dao.ProgramRepository;
import org.avni.server.domain.CHSEntity;
import org.avni.server.domain.Individual;
import org.avni.server.domain.Program;
import org.avni.server.domain.ProgramEnrolment;
import org.avni.server.service.ConceptService;
import org.avni.server.service.ProgramEnrolmentService;
import org.avni.server.util.S;
import org.avni.server.web.request.api.RequestUtils;
import org.avni.server.web.response.ProgramEnrolmentResponse;
import org.avni.server.web.response.ResponsePage;
import org.avni.server.web.request.api.ApiProgramEnrolmentRequest;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
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
    private final ProgramEnrolmentService programEnrolmentService;

    @Autowired
    public ProgramEnrolmentApiController(ProgramEnrolmentRepository programEnrolmentRepository, ConceptRepository conceptRepository, ConceptService conceptService, IndividualRepository individualRepository, ProgramRepository programRepository, ProgramEnrolmentService programEnrolmentService) {
        this.programEnrolmentRepository = programEnrolmentRepository;
        this.conceptRepository = conceptRepository;
        this.conceptService = conceptService;
        this.individualRepository = individualRepository;
        this.programRepository = programRepository;
        this.programEnrolmentService = programEnrolmentService;
    }

    @PostMapping(value = "/api/programEnrolment")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    @ResponseBody
    public ResponseEntity post(@RequestBody ApiProgramEnrolmentRequest request) {
        ProgramEnrolment programEnrolment = createProgramEnrolment(request.getExternalId());
        initializeIndividual(request, programEnrolment);
        updateEnrolment(programEnrolment, request);
        return new ResponseEntity<>(ProgramEnrolmentResponse.fromProgramEnrolment(programEnrolment, conceptRepository, conceptService), HttpStatus.OK);
    }

    private void initializeIndividual(ApiProgramEnrolmentRequest request, ProgramEnrolment programEnrolment) {
        Individual individual = individualRepository.getSubject(request.getSubjectUuid(), request.getSubjectExternalId());
        ApiErrorUtil.throwIfSubjectNotFound(individual, request.getSubjectUuid(), request.getSubjectExternalId());
        programEnrolment.setIndividual(individual);
    }

    @PutMapping(value = "/api/programEnrolment/{id}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    @ResponseBody
    public ResponseEntity<ProgramEnrolmentResponse> put(@PathVariable String id, @RequestBody ApiProgramEnrolmentRequest request) {
        ProgramEnrolment programEnrolment = programEnrolmentRepository.findByLegacyIdOrUuid(id);
        if (programEnrolment == null && StringUtils.hasLength(request.getExternalId())) {
            programEnrolment = programEnrolmentRepository.findByLegacyId(request.getExternalId().trim());
        }
        if (programEnrolment == null) {
            throw new IllegalArgumentException(String.format("ProgramEnrolment not found with id '%s' or External ID '%s'", id, request.getExternalId()));
        }
        programEnrolment = updateEnrolment(programEnrolment, request);
        return new ResponseEntity<>(ProgramEnrolmentResponse.fromProgramEnrolment(programEnrolment, conceptRepository, conceptService), HttpStatus.OK);
    }

    private ProgramEnrolment updateEnrolment(ProgramEnrolment enrolment, ApiProgramEnrolmentRequest request) {
        Program program = programRepository.findByName(request.getProgram());
        if (program == null) {
            throw new IllegalArgumentException(String.format("Program not found with name '%s'", request.getProgram()));
        }
        if(StringUtils.hasLength(request.getExternalId())) {
            enrolment.setLegacyId(request.getExternalId().trim());
        }
        enrolment.setProgram(program);
        enrolment.setEnrolmentLocation(request.getEnrolmentLocation());
        enrolment.setExitLocation(request.getExitLocation());
        enrolment.setEnrolmentDateTime(request.getEnrolmentDateTime());
        enrolment.setProgramExitDateTime(request.getExitDateTime());
        enrolment.setObservations(RequestUtils.createObservations(request.getObservations(), conceptRepository));
        enrolment.setProgramExitObservations(RequestUtils.createObservations(request.getExitObservations(), conceptRepository));
        enrolment.setVoided(request.isVoided());
        return programEnrolmentService.save(enrolment);
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
            programEnrolments = programEnrolmentRepository.findByLastModifiedDateTimeGreaterThanAndLastModifiedDateTimeLessThanOrderByLastModifiedDateTimeAscIdAsc(CHSEntity.toDate(lastModifiedDateTime), CHSEntity.toDate(now), pageable);
        } else if (S.isEmpty(subjectUuid) && lastModifiedDateTime != null) {
            programEnrolments = programEnrolmentRepository.findByLastModifiedDateTimeGreaterThanAndLastModifiedDateTimeLessThanAndProgramNameOrderByLastModifiedDateTimeAscIdAsc(CHSEntity.toDate(lastModifiedDateTime), CHSEntity.toDate(now), program, pageable);
        } else if (!S.isEmpty(subjectUuid) && !S.isEmpty(program)) {
            programEnrolments = programEnrolmentRepository.findByProgramNameAndIndividualUuidOrderByLastModifiedDateTimeAscIdAsc(program, subjectUuid, pageable);
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
    public ResponseEntity<ProgramEnrolmentResponse> get(@PathVariable("id") String legacyIdOrUuid) {
        ProgramEnrolment programEnrolment = programEnrolmentRepository.findByLegacyIdOrUuid(legacyIdOrUuid);
        if (programEnrolment == null)
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(ProgramEnrolmentResponse.fromProgramEnrolment(programEnrolment, conceptRepository, conceptService), HttpStatus.OK);
    }

    @DeleteMapping(value = "/api/programEnrolment/{id}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public ResponseEntity<ProgramEnrolmentResponse> delete(@PathVariable("id") String legacyIdOrUuid) {
        ProgramEnrolment programEnrolment = programEnrolmentRepository.findByLegacyIdOrUuid(legacyIdOrUuid);
        if (programEnrolment == null)
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        programEnrolment = programEnrolmentService.voidEnrolment(programEnrolment);
        return new ResponseEntity<>(ProgramEnrolmentResponse.fromProgramEnrolment(programEnrolment, conceptRepository, conceptService), HttpStatus.OK);
    }

    private ProgramEnrolment createProgramEnrolment(String externalId) {
        if (StringUtils.hasLength(externalId)) {
            ProgramEnrolment enrolment = programEnrolmentRepository.findByLegacyId(externalId.trim());
            if (enrolment != null) {
                return enrolment;
            }
        }
        ProgramEnrolment programEnrolment = new ProgramEnrolment();
        programEnrolment.assignUUID();
        if (StringUtils.hasLength(externalId)) {
            programEnrolment.setLegacyId(externalId.trim());
        }
        return programEnrolment;
    }
}
