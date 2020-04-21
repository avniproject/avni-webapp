package org.openchs.web;

import org.openchs.application.Form;
import org.openchs.application.FormMapping;
import org.openchs.application.FormType;
import org.openchs.dao.*;
import org.openchs.dao.application.FormMappingRepository;
import org.openchs.dao.application.FormRepository;
import org.openchs.domain.EncounterType;
import org.openchs.domain.OperationalEncounterType;
import org.openchs.service.EncounterTypeService;
import org.openchs.util.ReactAdminUtil;
import org.openchs.web.request.EncounterTypeContract;
import org.openchs.web.request.webapp.EncounterTypeContractWeb;
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
public class EncounterTypeController extends AbstractController<EncounterType> implements RestControllerResourceProcessor<EncounterTypeContractWeb> {
    private final Logger logger;
    private final OperationalEncounterTypeRepository operationalEncounterTypeRepository;
    private final EncounterTypeService encounterTypeService;
    private EncounterTypeRepository encounterTypeRepository;
    private FormMappingRepository formMappingRepository;
    private SubjectTypeRepository subjectTypeRepository;
    private ProgramRepository programRepository;
    private FormRepository formRepository;

    @Autowired
    public EncounterTypeController(EncounterTypeRepository encounterTypeRepository, OperationalEncounterTypeRepository operationalEncounterTypeRepository, EncounterTypeService encounterTypeService, FormMappingRepository formMappingRepository, SubjectTypeRepository subjectTypeRepository, ProgramRepository programRepository, FormRepository formRepository) {
        this.encounterTypeRepository = encounterTypeRepository;
        this.operationalEncounterTypeRepository = operationalEncounterTypeRepository;
        this.encounterTypeService = encounterTypeService;
        this.formMappingRepository = formMappingRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.programRepository = programRepository;
        this.formRepository = formRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/encounterTypes", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    void save(@RequestBody List<EncounterTypeContract> encounterTypeRequests) {
        for (EncounterTypeContract encounterTypeRequest : encounterTypeRequests) {
            encounterTypeService.createEncounterType(encounterTypeRequest);
        }
    }

    @GetMapping(value = "/web/encounterType")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public PagedResources<Resource<EncounterTypeContractWeb>> getAll(Pageable pageable) {
        return wrap(operationalEncounterTypeRepository
                .findPageByIsVoidedFalse(pageable)
                .map(EncounterTypeContractWeb::fromOperationalEncounterType));
    }

    @GetMapping(value = "/web/encounterTypes")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public List<OperationalEncounterType> encounterTypes() {
        return operationalEncounterTypeRepository.findAll();
    }

    @GetMapping(value = "/web/encounterType/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public ResponseEntity getOne(@PathVariable("id") Long id) {
        OperationalEncounterType operationalEncounterType = operationalEncounterTypeRepository.findOne(id);
        if (operationalEncounterType.isVoided())
            return ResponseEntity.notFound().build();
        EncounterTypeContractWeb encounterTypeContractWeb = EncounterTypeContractWeb.fromOperationalEncounterType(operationalEncounterType);
        return new ResponseEntity<>(encounterTypeContractWeb, HttpStatus.OK);
    }

    @PostMapping(value = "/web/encounterType")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    ResponseEntity saveEncounterTypeForWeb(@RequestBody EncounterTypeContractWeb request) {
        EncounterType existingEncounterType =
                encounterTypeRepository.findByNameIgnoreCase(request.getName());
        OperationalEncounterType existingOperationalEncounterType =
                operationalEncounterTypeRepository.findByNameIgnoreCase(request.getName());
        if (existingEncounterType != null || existingOperationalEncounterType != null)
            return ResponseEntity.badRequest().body(
                    ReactAdminUtil.generateJsonError(String.format("EncounterType %s already exists", request.getName()))
            );
        EncounterType encounterType = new EncounterType();
        encounterType.assignUUID();
        encounterType.setName(request.getName());
        encounterType.setEncounterEligibilityCheckRule(request.getEncounterEligibilityCheckRule());
        encounterTypeRepository.save(encounterType);
        OperationalEncounterType operationalEncounterType = new OperationalEncounterType();
        operationalEncounterType.assignUUID();
        operationalEncounterType.setName(request.getName());
        operationalEncounterType.setEncounterType(encounterType);
        operationalEncounterTypeRepository.save(operationalEncounterType);

        saveFormMapping(request, encounterType, request.getProgramEncounterFormUuid(), FormType.ProgramEncounter, formRepository.findByUuid(request.getProgramEncounterFormUuid()));
        saveFormMapping(request, encounterType, request.getProgramEncounterCancelFormUuid(), FormType.ProgramEncounterCancellation, formRepository.findByUuid(request.getProgramEncounterCancelFormUuid()));


        return ResponseEntity.ok(EncounterTypeContractWeb.fromOperationalEncounterType(operationalEncounterType));
    }

    @PutMapping(value = "/web/encounterType/{id}")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    public ResponseEntity updateEncounterTypeForWeb(@RequestBody EncounterTypeContractWeb request,
                                                  @PathVariable("id") Long id) {
        logger.info(String.format("Processing Subject Type update request: %s", request.toString()));
        if (request.getName().trim().equals(""))
            return ResponseEntity.badRequest().body(ReactAdminUtil.generateJsonError("Name can not be empty"));

        OperationalEncounterType operationalEncounterType = operationalEncounterTypeRepository.findOne(id);

        if (operationalEncounterType == null)
            return ResponseEntity.badRequest()
                    .body(ReactAdminUtil.generateJsonError(String.format("Subject Type with id '%d' not found", id)));

        EncounterType encounterType = operationalEncounterType.getEncounterType();

        encounterType.setName(request.getName());
        encounterType.setEncounterEligibilityCheckRule(request.getEncounterEligibilityCheckRule());
        encounterTypeRepository.save(encounterType);

        operationalEncounterType.setName(request.getName());
        operationalEncounterTypeRepository.save(operationalEncounterType);

        saveFormMapping(request, encounterType, request.getProgramEncounterFormUuid(), FormType.ProgramEncounter, formRepository.findByUuid(request.getProgramEncounterFormUuid()));
        saveFormMapping(request, encounterType, request.getProgramEncounterCancelFormUuid(), FormType.ProgramEncounterCancellation, formRepository.findByUuid(request.getProgramEncounterCancelFormUuid()));

        return ResponseEntity.ok(EncounterTypeContractWeb.fromOperationalEncounterType(operationalEncounterType));
    }

    private void saveFormMapping(EncounterTypeContractWeb request, EncounterType encounterType, String programEncounterFormUuid, FormType formType, Form form) {
        FormMapping formMappingForProgramEncounter;
        if (programEncounterFormUuid != null && !programEncounterFormUuid.isEmpty()) {
            formMappingForProgramEncounter = getOrCreateFormMapping(formType, encounterType.getUuid(), request.getSubjectTypeUuid());
        } else {
           formMappingForProgramEncounter = createFormMapping();
        }

        formMappingForProgramEncounter.setSubjectType(subjectTypeRepository.findByUuid(request.getSubjectTypeUuid()));
        formMappingForProgramEncounter.setEncounterType(encounterType);
        formMappingForProgramEncounter.setProgram(programRepository.findByUuid(request.getProgramUuid()));
        formMappingForProgramEncounter.setForm(form);

        formMappingRepository.save(formMappingForProgramEncounter);
    }

    private FormMapping getOrCreateFormMapping(FormType formType, String encounterTypeUuid, String subjectTypeUuid) {
        FormMapping formMappingForProgramEncounter = formMappingRepository.getRequiredFormMapping(subjectTypeUuid, null, encounterTypeUuid, formType);
        if (formMappingForProgramEncounter == null) {
            formMappingForProgramEncounter = createFormMapping();
        }
        return formMappingForProgramEncounter;
    }

    private FormMapping createFormMapping() {
        FormMapping formMappingForProgramEncounter;
        formMappingForProgramEncounter = new FormMapping();
        formMappingForProgramEncounter.assignUUID();
        formMappingForProgramEncounter.setVoided(false);
        return formMappingForProgramEncounter;
    }

    @DeleteMapping(value = "/web/encounterType/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @Transactional
    public ResponseEntity voidEncounterType(@PathVariable("id") Long id) {
        OperationalEncounterType operationalEncounterType = operationalEncounterTypeRepository.findOne(id);
        if (operationalEncounterType == null)
            return ResponseEntity.notFound().build();
        EncounterType encounterType = operationalEncounterType.getEncounterType();
        if (encounterType == null)
            return ResponseEntity.notFound().build();

        operationalEncounterType.setName(ReactAdminUtil.getVoidedName(operationalEncounterType.getName(), operationalEncounterType.getId()));
        operationalEncounterType.setVoided(true);
        encounterType.setName(ReactAdminUtil.getVoidedName(encounterType.getName(), encounterType.getId()));
        encounterType.setVoided(true);
        operationalEncounterTypeRepository.save(operationalEncounterType);
        encounterTypeRepository.save(encounterType);

        return ResponseEntity.ok(null);
    }
}
