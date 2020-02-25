package org.openchs.web;

import org.openchs.dao.IdentifierSourceRepository;
import org.openchs.dao.IdentifierUserAssignmentRepository;
import org.openchs.dao.UserRepository;
import org.openchs.domain.IdentifierUserAssignment;
import org.openchs.domain.JsonObject;
import org.openchs.util.ReactAdminUtil;
import org.openchs.web.request.IdentifierUserAssignmentContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;

@RestController
public class IdentifierUserAssignmentController extends AbstractController<IdentifierUserAssignment> implements RestControllerResourceProcessor<IdentifierUserAssignment> {
    private IdentifierUserAssignmentRepository identifierUserAssignmentRepository;
    private UserRepository userRepository;
    private IdentifierSourceRepository identifierSourceRepository;

    @Autowired
    public IdentifierUserAssignmentController(IdentifierUserAssignmentRepository identifierUserAssignmentRepository, UserRepository userRepository, IdentifierSourceRepository identifierSourceRepository) {
        this.identifierUserAssignmentRepository = identifierUserAssignmentRepository;
        this.userRepository = userRepository;
        this.identifierSourceRepository = identifierSourceRepository;
    }

    @RequestMapping(value = "/identifierUserAssignments", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    void save(@RequestBody List<IdentifierUserAssignmentContract> contracts) {
        contracts.forEach(this::save);
    }

    void save(IdentifierUserAssignmentContract contract) {
        IdentifierUserAssignment identifierUserAssignment = newOrExistingEntity(identifierUserAssignmentRepository, contract, new IdentifierUserAssignment());
        identifierUserAssignment.setAssignedTo(userRepository.findByUuid(contract.getUserUUID()));
        identifierUserAssignment.setIdentifierSource(identifierSourceRepository.findByUuid(contract.getIdentifierSourceUUID()));
        identifierUserAssignment.setIdentifierStart(contract.getIdentifierStart());
        identifierUserAssignment.setIdentifierEnd(contract.getIdentifierEnd());
        identifierUserAssignment.setVoided(contract.isVoided());

        identifierUserAssignmentRepository.save(identifierUserAssignment);
    }

    @GetMapping(value = "/web/identifierUserAssignment")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public PagedResources<Resource<IdentifierUserAssignment>> getAll(Pageable pageable) {
        return wrap(identifierUserAssignmentRepository.findPageByIsVoidedFalse(pageable));
    }

    @GetMapping(value = "/web/identifierUserAssignment/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public ResponseEntity getOne(@PathVariable("id") Long id) {
        IdentifierUserAssignment identifierUserAssignment = identifierUserAssignmentRepository.findOne(id);
        if (identifierUserAssignment.isVoided())
            return ResponseEntity.notFound().build();
        return new ResponseEntity<>(identifierUserAssignment, HttpStatus.OK);
    }

    @PostMapping(value = "/web/identifierUserAssignment")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    ResponseEntity saveProgramForWeb(@RequestBody IdentifierUserAssignmentContract request) {
        IdentifierUserAssignment identifierUserAssignment = new IdentifierUserAssignment();
        identifierUserAssignment.assignUUID();
        identifierUserAssignment.setAssignedTo(userRepository.findByUuid(request.getUserUUID()));
        identifierUserAssignment.setIdentifierSource(identifierSourceRepository.findByUuid(request.getIdentifierSourceUUID()));
        identifierUserAssignment.setIdentifierStart(request.getIdentifierStart());
        identifierUserAssignment.setIdentifierEnd(request.getIdentifierEnd());
        identifierUserAssignment.setVoided(false);
        identifierUserAssignmentRepository.save(identifierUserAssignment);
        return ResponseEntity.ok(null);
    }

    @PutMapping(value = "/web/identifierUserAssignment/{id}")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    public ResponseEntity updateProgramForWeb(@RequestBody IdentifierUserAssignmentContract request,
                                              @PathVariable("id") Long id) {
        IdentifierUserAssignment identifierUserAssignment = identifierUserAssignmentRepository.findOne(id);
        if (identifierUserAssignment == null)
            return ResponseEntity.badRequest()
                    .body(ReactAdminUtil.generateJsonError(String.format("Identifier source with id '%d' not found", id)));

        identifierUserAssignment.setAssignedTo(userRepository.findByUuid(request.getUserUUID()));
        identifierUserAssignment.setIdentifierSource(identifierSourceRepository.findByUuid(request.getIdentifierSourceUUID()));
        identifierUserAssignment.setIdentifierStart(request.getIdentifierStart());
        identifierUserAssignment.setIdentifierEnd(request.getIdentifierEnd());
        identifierUserAssignment.setVoided(request.isVoided());
        identifierUserAssignmentRepository.save(identifierUserAssignment);
        return ResponseEntity.ok(null);
    }

    @DeleteMapping(value = "/web/identifierUserAssignment/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @Transactional
    public ResponseEntity voidProgram(@PathVariable("id") Long id) {
        IdentifierUserAssignment identifierSource = identifierUserAssignmentRepository.findOne(id);
        if (identifierSource == null)
            return ResponseEntity.notFound().build();

        identifierSource.setVoided(true);
        identifierUserAssignmentRepository.save(identifierSource);
        return ResponseEntity.ok(null);
    }


}
