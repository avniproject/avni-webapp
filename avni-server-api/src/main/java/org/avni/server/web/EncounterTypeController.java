package org.avni.server.web;

import org.avni.server.application.Form;
import org.avni.server.application.FormType;
import org.avni.server.dao.EncounterTypeRepository;
import org.avni.server.dao.OperationalEncounterTypeRepository;
import org.avni.server.domain.EncounterType;
import org.avni.server.domain.OperationalEncounterType;
import org.avni.server.service.EncounterTypeService;
import org.avni.server.service.FormMappingParameterObject;
import org.avni.server.service.FormMappingService;
import org.avni.server.service.FormService;
import org.avni.server.util.ReactAdminUtil;
import org.avni.server.web.request.EntityTypeContract;
import org.avni.server.web.request.webapp.EncounterTypeContractWeb;
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
    private final EncounterTypeRepository encounterTypeRepository;
    private final FormService formService;
    private final FormMappingService formMappingSevice;

    @Autowired
    public EncounterTypeController(EncounterTypeRepository encounterTypeRepository,
                                   OperationalEncounterTypeRepository operationalEncounterTypeRepository,
                                   EncounterTypeService encounterTypeService,
                                   FormService formService,
                                   FormMappingService formMappingSevice) {
        this.encounterTypeRepository = encounterTypeRepository;
        this.operationalEncounterTypeRepository = operationalEncounterTypeRepository;
        this.encounterTypeService = encounterTypeService;
        this.formService = formService;
        this.formMappingSevice = formMappingSevice;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/encounterTypes", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    void save(@RequestBody List<EntityTypeContract> encounterTypeRequests) {
        for (EntityTypeContract encounterTypeRequest : encounterTypeRequests) {
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
        buildEncounter(encounterType, request);
        encounterTypeRepository.save(encounterType);
        OperationalEncounterType operationalEncounterType = new OperationalEncounterType();
        operationalEncounterType.assignUUID();
        operationalEncounterType.setName(request.getName());
        operationalEncounterType.setEncounterType(encounterType);
        operationalEncounterTypeRepository.save(operationalEncounterType);

        saveFormsAndMapping(request, encounterType);

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
        buildEncounter(encounterType, request);
        encounterTypeRepository.save(encounterType);

        operationalEncounterType.setName(request.getName());
        operationalEncounterTypeRepository.save(operationalEncounterType);

        saveFormsAndMapping(request, encounterType);

        return ResponseEntity.ok(EncounterTypeContractWeb.fromOperationalEncounterType(operationalEncounterType));
    }

    private void buildEncounter(EncounterType encounterType, EncounterTypeContractWeb request) {
        encounterType.setName(request.getName());
        encounterType.setEncounterEligibilityCheckRule(request.getEncounterEligibilityCheckRule());
        encounterType.setEncounterEligibilityCheckDeclarativeRule(request.getEncounterEligibilityCheckDeclarativeRule());
        encounterType.setActive(request.getActive());
        encounterType.setImmutable(request.isImmutable());
    }

    private void saveFormsAndMapping(EncounterTypeContractWeb request, EncounterType encounterType) {
        FormType encounterFormType = request.getProgramUuid() == null ?
                FormType.Encounter : FormType.ProgramEncounter;
        FormType cancellationFormType = request.getProgramUuid() == null ?
                FormType.IndividualEncounterCancellation : FormType.ProgramEncounterCancellation;

        Form encounterForm = formService.getOrCreateForm(request.getProgramEncounterFormUuid(), String.format("%s Encounter", encounterType.getName()), encounterFormType);
        formMappingSevice.saveFormMapping(
                new FormMappingParameterObject(request.getSubjectTypeUuid(), request.getProgramUuid(), encounterType.getUuid()),
                new FormMappingParameterObject(null, null, encounterType.getUuid()),
                encounterForm);

        Form cancellationForm = formService.getOrCreateForm(request.getProgramEncounterCancelFormUuid(), String.format("%s Encounter Cancellation", encounterType.getName()), cancellationFormType);
        formMappingSevice.saveFormMapping(
                new FormMappingParameterObject(request.getSubjectTypeUuid(), request.getProgramUuid(), encounterType.getUuid()),
                new FormMappingParameterObject(null, null, encounterType.getUuid()),
                cancellationForm);
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

        formMappingSevice.voidExistingFormMappings(new FormMappingParameterObject(null, null, encounterType.getUuid()), null);

        return ResponseEntity.ok(null);
    }
}
