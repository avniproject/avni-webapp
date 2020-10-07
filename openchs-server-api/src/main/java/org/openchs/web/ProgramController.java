package org.openchs.web;

import org.openchs.application.Form;
import org.openchs.application.FormType;
import org.openchs.dao.IndividualRepository;
import org.openchs.dao.OperationalProgramRepository;
import org.openchs.dao.ProgramRepository;
import org.openchs.domain.Individual;
import org.openchs.domain.OperationalProgram;
import org.openchs.domain.Program;
import org.openchs.service.FormMappingParameterObject;
import org.openchs.service.FormMappingService;
import org.openchs.service.FormService;
import org.openchs.service.ProgramService;
import org.openchs.util.BadRequestError;
import org.openchs.util.ReactAdminUtil;
import org.openchs.web.request.ProgramRequest;
import org.openchs.web.request.webapp.ProgramContractWeb;
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
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class ProgramController implements RestControllerResourceProcessor<ProgramContractWeb> {
    private final Logger logger;
    private ProgramRepository programRepository;
    private OperationalProgramRepository operationalProgramRepository;
    private ProgramService programService;
    private final IndividualRepository individualRepository;
    private FormService formService;
    private FormMappingService formMappingService;

    @Autowired
    public ProgramController(ProgramRepository programRepository,
                             OperationalProgramRepository operationalProgramRepository,
                             ProgramService programService,
                             IndividualRepository individualRepository,
                             FormService formService,
                             FormMappingService formMappingService) {
        this.programRepository = programRepository;
        this.operationalProgramRepository = operationalProgramRepository;
        this.programService = programService;
        this.individualRepository = individualRepository;
        this.formService = formService;
        this.formMappingService = formMappingService;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/programs", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    public void save(@RequestBody List<ProgramRequest> programRequests) {
        programRequests.forEach(programRequest -> {
            programService.saveProgram(programRequest);
        });
    }

    @PostMapping(value = "/web/program")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    ResponseEntity saveProgramForWeb(@RequestBody ProgramContractWeb request) {
        Program existingProgram =
                programRepository.findByNameIgnoreCase(request.getName());
        OperationalProgram existingOperationalProgram =
                operationalProgramRepository.findByNameIgnoreCase(request.getName());
        if (existingProgram != null || existingOperationalProgram != null)
            return ResponseEntity.badRequest().body(ReactAdminUtil.generateJsonError(String.format("Program %s already exists", request.getName())));
        Program program = new Program();
        program.assignUUIDIfRequired();
        program.setName(request.getName());
        program.setColour(request.getColour());
        program.setEnrolmentSummaryRule(request.getEnrolmentSummaryRule());
        program.setEnrolmentEligibilityCheckRule(request.getEnrolmentEligibilityCheckRule());
        programRepository.save(program);
        OperationalProgram operationalProgram = new OperationalProgram();
        operationalProgram.assignUUIDIfRequired();
        operationalProgram.setName(request.getName());
        operationalProgram.setProgramSubjectLabel(request.getProgramSubjectLabel());
        operationalProgram.setProgram(program);
        operationalProgramRepository.save(operationalProgram);

        saveFormsAndMapping(request, program);

        return ResponseEntity.ok(ProgramContractWeb.fromOperationalProgram(operationalProgram));
    }

    private void saveFormsAndMapping(@RequestBody ProgramContractWeb request, Program program) {
        Form enrolmentForm = formService.getOrCreateForm(request.getProgramEnrolmentFormUuid(),
                String.format("%s Enrolment", program.getName()),
                FormType.ProgramEnrolment);
        formMappingService.saveFormMapping(
                new FormMappingParameterObject(request.getSubjectTypeUuid(), program.getUuid(), null),
                new FormMappingParameterObject(null, program.getUuid(), null),
                enrolmentForm);

        Form exitForm = formService.getOrCreateForm(request.getProgramExitFormUuid(),
                String.format("%s Exit", program.getName()),
                FormType.ProgramExit);
        formMappingService.saveFormMapping(
                new FormMappingParameterObject(request.getSubjectTypeUuid(), program.getUuid(), null),
                new FormMappingParameterObject(null, program.getUuid(), null),
                exitForm);
    }

    @PutMapping(value = "/web/program/{id}")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    public ResponseEntity updateProgramForWeb(@RequestBody ProgramContractWeb request,
                                              @PathVariable("id") Long id) {
        logger.info(String.format("Processing Operational Program update request: %s", request.toString()));
        if (request.getName().trim().equals(""))
            return ResponseEntity.badRequest().body(ReactAdminUtil.generateJsonError("Name can not be empty"));

        OperationalProgram operationalProgram = operationalProgramRepository.findOne(id);

        if (operationalProgram == null)
            return ResponseEntity.badRequest()
                    .body(ReactAdminUtil.generateJsonError(String.format("Operational Program with id '%d' not found", id)));

        Program program = operationalProgram.getProgram();

        program.setName(request.getName());
        program.setColour(request.getColour());
        program.setEnrolmentSummaryRule(request.getEnrolmentSummaryRule());
        program.setEnrolmentEligibilityCheckRule(request.getEnrolmentEligibilityCheckRule());
        program.setActive(request.getActive());

        programRepository.save(program);

        operationalProgram.setProgramSubjectLabel(request.getProgramSubjectLabel());
        operationalProgram.setName(request.getName());
        operationalProgramRepository.save(operationalProgram);

        saveFormsAndMapping(request, program);

        return ResponseEntity.ok(ProgramContractWeb.fromOperationalProgram(operationalProgram));
    }

    @DeleteMapping(value = "/web/program/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @Transactional
    public ResponseEntity voidProgram(@PathVariable("id") Long id) {
        OperationalProgram operationalProgram = operationalProgramRepository.findOne(id);
        if (operationalProgram == null)
            return ResponseEntity.notFound().build();
        Program program = operationalProgram.getProgram();
        if (program == null)
            return ResponseEntity.notFound().build();

        operationalProgram.setName(ReactAdminUtil.getVoidedName(operationalProgram.getName(), operationalProgram.getId()));
        program.setName(ReactAdminUtil.getVoidedName(program.getName(), program.getId()));
        operationalProgram.setVoided(true);
        program.setVoided(true);
        operationalProgramRepository.save(operationalProgram);
        programRepository.save(program);

        formMappingService.voidExistingFormMappings(new FormMappingParameterObject(null, program.getUuid(), null), null);

        return ResponseEntity.ok(null);
    }

    @GetMapping(value = "/web/program")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public PagedResources<Resource<ProgramContractWeb>> getAll(Pageable pageable) {
        return wrap(operationalProgramRepository
                .findPageByIsVoidedFalse(pageable)
                .map(ProgramContractWeb::fromOperationalProgram));
    }

    @GetMapping(value = "web/eligiblePrograms")
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    @ResponseBody
    public List<ProgramContractWeb> getEligiblePrograms(@RequestParam String subjectUuid) {
        Individual individual = individualRepository.findByUuid(subjectUuid);
        if (individual == null) throw new BadRequestError("Subject %s not found", subjectUuid);
        List<Program> eligiblePrograms = programService.getEligiblePrograms(individual);
        List<OperationalProgram> operationalPrograms = new ArrayList<>();
        for (Program p : eligiblePrograms) {
            operationalPrograms.addAll(p.getOperationalPrograms());
        }
        return operationalPrograms.stream()
                .map(operationalProgram -> ProgramContractWeb.fromOperationalProgram(operationalProgram))
                .collect(Collectors.toList());
    }

    @GetMapping(value = "/web/programs")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public List<OperationalProgram> getAllPrograms() {
        return operationalProgramRepository.findAll();
    }

    @GetMapping(value = "/web/program/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public ResponseEntity getOne(@PathVariable("id") Long id) {
        OperationalProgram operationalProgram = operationalProgramRepository.findOne(id);
        if (operationalProgram.isVoided())
            return ResponseEntity.notFound().build();
        ProgramContractWeb programContractWeb = ProgramContractWeb.fromOperationalProgram(operationalProgram);
        return new ResponseEntity<>(programContractWeb, HttpStatus.OK);
    }

}
