package org.openchs.web;

import org.joda.time.DateTime;
import org.openchs.dao.CatchmentRepository;
import org.openchs.dao.FacilityRepository;
import org.openchs.dao.IdentifierSourceRepository;
import org.openchs.domain.IdentifierSource;
import org.openchs.domain.JsonObject;
import org.openchs.domain.User;
import org.openchs.service.UserService;
import org.openchs.util.ReactAdminUtil;
import org.openchs.web.request.IdentifierSourceContract;
import org.openchs.web.request.webapp.IdentifierSourceContractWeb;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;

@RestController
public class IdentifierSourceWebController extends AbstractController<IdentifierSource> implements RestControllerResourceProcessor<IdentifierSourceContractWeb> {
    private IdentifierSourceRepository identifierSourceRepository;

    private static org.slf4j.Logger logger = LoggerFactory.getLogger(IndividualController.class);
    private UserService userService;
    private CatchmentRepository catchmentRepository;
    private FacilityRepository facilityRepository;

    @Autowired
    public IdentifierSourceWebController(IdentifierSourceRepository identifierSourceRepository, UserService userService, CatchmentRepository catchmentRepository, FacilityRepository facilityRepository) {
        this.identifierSourceRepository = identifierSourceRepository;
        this.userService = userService;
        this.catchmentRepository = catchmentRepository;
        this.facilityRepository = facilityRepository;
    }

    @GetMapping(value = "/web/identifierSource")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public PagedResources<Resource<IdentifierSourceContractWeb>> getAll(Pageable pageable) {
        return wrap(identifierSourceRepository.findPageByIsVoidedFalse(pageable).map(IdentifierSourceContractWeb::fromIdentifierSource));
    }

    @GetMapping(value = "/web/identifierSource/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public ResponseEntity getOne(@PathVariable("id") Long id) {
        IdentifierSource identifierSource = identifierSourceRepository.findOne(id);
        if (identifierSource.isVoided())
            return ResponseEntity.notFound().build();
        return new ResponseEntity<>(IdentifierSourceContractWeb.fromIdentifierSource(identifierSource), HttpStatus.OK);
    }


    @PostMapping(value = "/web/identifierSource")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    ResponseEntity saveProgramForWeb(@RequestBody IdentifierSourceContractWeb request) {
        IdentifierSource identifierSource = new IdentifierSource();
        identifierSource.assignUUID();
        identifierSource.setBatchGenerationSize(request.getBatchGenerationSize());
        identifierSource.setCatchment(request.getCatchmentId() == null ? null : catchmentRepository.findOne(request.getCatchmentId()));
        identifierSource.setMinimumBalance(request.getMinimumBalance());
        identifierSource.setName(request.getName());
        identifierSource.setOptions(request.getOptions() == null ? new JsonObject() : request.getOptions());
        identifierSource.setType(request.getType());
        identifierSource.setVoided(request.isVoided());
        identifierSource.setMinLength(request.getMinLength());
        identifierSource.setMaxLength(request.getMaxLength());
        identifierSourceRepository.save(identifierSource);
        return ResponseEntity.ok(IdentifierSourceContractWeb.fromIdentifierSource(identifierSource));
    }

    @PutMapping(value = "/web/identifierSource/{id}")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    public ResponseEntity updateProgramForWeb(@RequestBody IdentifierSourceContractWeb request,
                                              @PathVariable("id") Long id) {
        IdentifierSource identifierSource = identifierSourceRepository.findOne(id);
        if (identifierSource == null)
            return ResponseEntity.badRequest()
                    .body(ReactAdminUtil.generateJsonError(String.format("Identifier source with id '%d' not found", id)));

        identifierSource.setBatchGenerationSize(request.getBatchGenerationSize());
        identifierSource.setCatchment(request.getCatchmentId() == null ? null : catchmentRepository.findOne(request.getCatchmentId()));
        identifierSource.setMinimumBalance(request.getMinimumBalance());
        identifierSource.setName(request.getName());
        identifierSource.setOptions(request.getOptions() == null ? new JsonObject() : request.getOptions());//request.getOptions());
        identifierSource.setType(request.getType());
        identifierSource.setVoided(request.isVoided());
        identifierSource.setMinLength(request.getMinLength());
        identifierSource.setMaxLength(request.getMaxLength());
        identifierSourceRepository.save(identifierSource);
        return ResponseEntity.ok(IdentifierSourceContractWeb.fromIdentifierSource(identifierSource));
    }

    @DeleteMapping(value = "/web/identifierSource/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @Transactional
    public ResponseEntity voidProgram(@PathVariable("id") Long id) {
        IdentifierSource identifierSource = identifierSourceRepository.findOne(id);
        if (identifierSource == null)
            return ResponseEntity.notFound().build();

        identifierSource.setVoided(true);
        identifierSourceRepository.save(identifierSource);
        return ResponseEntity.ok(null);
    }
}