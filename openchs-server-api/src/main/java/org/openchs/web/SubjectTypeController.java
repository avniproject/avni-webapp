package org.openchs.web;

import org.openchs.dao.OperationalSubjectTypeRepository;
import org.openchs.dao.SubjectTypeRepository;
import org.openchs.domain.OperationalSubjectType;
import org.openchs.domain.SubjectType;
import org.openchs.util.ReactAdminUtil;
import org.openchs.web.request.SubjectTypeContract;
import org.openchs.web.request.webapp.SubjectTypeContractWeb;
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
public class SubjectTypeController implements RestControllerResourceProcessor<SubjectTypeContractWeb> {
    private final Logger logger;
    private SubjectTypeRepository subjectTypeRepository;
    private final OperationalSubjectTypeRepository operationalSubjectTypeRepository;

    @Autowired
    public SubjectTypeController(SubjectTypeRepository subjectTypeRepository, OperationalSubjectTypeRepository operationalSubjectTypeRepository) {
        this.subjectTypeRepository = subjectTypeRepository;
        this.operationalSubjectTypeRepository = operationalSubjectTypeRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/subjectTypes", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    public void save(@RequestBody List<SubjectTypeContract> subjectTypeRequests) {
        subjectTypeRequests.forEach(subjectTypeRequest -> {
            logger.info(String.format("Creating subjectType: %s", subjectTypeRequest.toString()));
            SubjectType subjectType = subjectTypeRepository.findByUuid(subjectTypeRequest.getUuid());
            if (subjectType == null) {
                subjectType = createSubjectType(subjectTypeRequest);
            }

            subjectType.setName(subjectTypeRequest.getName());

            subjectTypeRepository.save(subjectType);
        });
    }

    private SubjectType createSubjectType(SubjectTypeContract programRequest) {
        SubjectType subjectType = new SubjectType();
        subjectType.setUuid(programRequest.getUuid());
        subjectType.setVoided(programRequest.isVoided());
        return subjectType;
    }

    @GetMapping(value = "/web/subjectType")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public PagedResources<Resource<SubjectTypeContractWeb>> getAll(Pageable pageable) {
        return wrap(operationalSubjectTypeRepository
                .findPageByIsVoidedFalse(pageable)
                .map(SubjectTypeContractWeb::fromOperationalSubjectType));
    }

    @GetMapping(value = "/web/subjectType/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public ResponseEntity getOne(@PathVariable("id") Long id) {
        OperationalSubjectType operationalSubjectType = operationalSubjectTypeRepository.findOne(id);
        if (operationalSubjectType.isVoided())
            return ResponseEntity.notFound().build();
        SubjectTypeContractWeb subjectTypeContractWeb = SubjectTypeContractWeb.fromOperationalSubjectType(operationalSubjectType);
        return new ResponseEntity<>(subjectTypeContractWeb, HttpStatus.OK);
    }

    @PostMapping(value = "/web/subjectType")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    ResponseEntity saveSubjectTypeForWeb(@RequestBody SubjectTypeContractWeb request) {
        SubjectType existingSubjectType =
                subjectTypeRepository.findByNameIgnoreCase(request.getName());
        OperationalSubjectType existingOperationalSubjectType =
                operationalSubjectTypeRepository.findByNameIgnoreCase(request.getName());
        if (existingSubjectType != null || existingOperationalSubjectType != null)
            return ResponseEntity.badRequest().body(
                    ReactAdminUtil.generateJsonError(String.format("SubjectType %s already exists", request.getName()))
            );
        SubjectType subjectType = new SubjectType();
        subjectType.assignUUID();
        subjectType.setName(request.getName());
        subjectTypeRepository.save(subjectType);
        OperationalSubjectType operationalSubjectType = new OperationalSubjectType();
        operationalSubjectType.assignUUID();
        operationalSubjectType.setName(request.getName());
        operationalSubjectType.setSubjectType(subjectType);
        operationalSubjectTypeRepository.save(operationalSubjectType);
        return ResponseEntity.ok(SubjectTypeContractWeb.fromOperationalSubjectType(operationalSubjectType));
    }

    @PutMapping(value = "/web/subjectType/{id}")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    public ResponseEntity updateSubjectTypeForWeb(@RequestBody SubjectTypeContractWeb request,
                                              @PathVariable("id") Long id) {
        logger.info(String.format("Processing Subject Type update request: %s", request.toString()));
        if (request.getName().trim().equals(""))
            return ResponseEntity.badRequest().body(ReactAdminUtil.generateJsonError("Name can not be empty"));

        OperationalSubjectType operationalSubjectType = operationalSubjectTypeRepository.findOne(id);

        if (operationalSubjectType == null)
            return ResponseEntity.badRequest()
                    .body(ReactAdminUtil.generateJsonError(String.format("Subject Type with id '%d' not found", id)));

        SubjectType subjectType = operationalSubjectType.getSubjectType();

        subjectType.setName(request.getName());
        subjectTypeRepository.save(subjectType);

        operationalSubjectType.setName(request.getName());
        operationalSubjectTypeRepository.save(operationalSubjectType);

        return ResponseEntity.ok(SubjectTypeContractWeb.fromOperationalSubjectType(operationalSubjectType));
    }

    @DeleteMapping(value = "/web/subjectType/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @Transactional
    public ResponseEntity voidSubjectType(@PathVariable("id") Long id) {
        OperationalSubjectType operationalSubjectType = operationalSubjectTypeRepository.findOne(id);
        if (operationalSubjectType == null)
            return ResponseEntity.notFound().build();
        SubjectType subjectType = operationalSubjectType.getSubjectType();
        if (subjectType == null)
            return ResponseEntity.notFound().build();

        operationalSubjectType.setName(ReactAdminUtil.getVoidedName(operationalSubjectType.getName(), operationalSubjectType.getId()));
        operationalSubjectType.setVoided(true);
        subjectType.setName(ReactAdminUtil.getVoidedName(subjectType.getName(), subjectType.getId()));
        subjectType.setVoided(true);
        operationalSubjectTypeRepository.save(operationalSubjectType);
        subjectTypeRepository.save(subjectType);

        return ResponseEntity.ok(null);
    }
}