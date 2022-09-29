package org.avni.server.web;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.RestController;
import org.avni.server.dao.IdentifierSourceRepository;
import org.avni.server.dao.IdentifierUserAssignmentRepository;
import org.avni.server.dao.UserRepository;
import org.avni.server.domain.IdentifierUserAssignment;
import org.avni.server.util.ReactAdminUtil;
import org.avni.server.web.request.webapp.IdentifierUserAssignmentContractWeb;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import javax.transaction.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
public class IdentifierUserAssignmentWebController extends AbstractController<IdentifierUserAssignment> implements RestControllerResourceProcessor<IdentifierUserAssignmentContractWeb> {
    private IdentifierUserAssignmentRepository identifierUserAssignmentRepository;
    private UserRepository userRepository;
    private IdentifierSourceRepository identifierSourceRepository;

    @Autowired
    public IdentifierUserAssignmentWebController(IdentifierUserAssignmentRepository identifierUserAssignmentRepository, UserRepository userRepository, IdentifierSourceRepository identifierSourceRepository) {
        this.identifierUserAssignmentRepository = identifierUserAssignmentRepository;
        this.userRepository = userRepository;
        this.identifierSourceRepository = identifierSourceRepository;
    }

    @GetMapping(value = "/web/identifierUserAssignment")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public PagedResources<Resource<IdentifierUserAssignmentContractWeb>> getAll(Pageable pageable) {
        Page<IdentifierUserAssignment> nonVoided = identifierUserAssignmentRepository.findPageByIsVoidedFalse(pageable);
        Page<IdentifierUserAssignmentContractWeb> response = nonVoided.map(identifierUserAssignment -> IdentifierUserAssignmentContractWeb.fromIdentifierUserAssignment(identifierUserAssignment));
        return wrap(response);
    }

    @GetMapping(value = "/web/identifierUserAssignment/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public ResponseEntity getOne(@PathVariable("id") Long id) {
        IdentifierUserAssignment identifierUserAssignment = identifierUserAssignmentRepository.findOne(id);
        if (identifierUserAssignment.isVoided())
            return ResponseEntity.notFound().build();
        return new ResponseEntity<>(IdentifierUserAssignmentContractWeb.fromIdentifierUserAssignment(identifierUserAssignment), HttpStatus.OK);
    }

    @PostMapping(value = "/web/identifierUserAssignment")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    ResponseEntity saveProgramForWeb(@RequestBody IdentifierUserAssignmentContractWeb request) {
        IdentifierUserAssignment identifierUserAssignment = new IdentifierUserAssignment();
        identifierUserAssignment.assignUUID();
        identifierUserAssignment.setAssignedTo(request.getUserId() == null ? null : userRepository.findOne(request.getUserId()));
        identifierUserAssignment.setIdentifierSource(request.getIdentifierSourceId() == null ? null : identifierSourceRepository.findOne(request.getIdentifierSourceId()));
        identifierUserAssignment.setIdentifierStart(request.getIdentifierStart());
        identifierUserAssignment.setIdentifierEnd(request.getIdentifierEnd());
        identifierUserAssignment.setVoided(false);
        identifierUserAssignmentRepository.save(identifierUserAssignment);
        return ResponseEntity.ok(IdentifierUserAssignmentContractWeb.fromIdentifierUserAssignment(identifierUserAssignment));
    }

    @PutMapping(value = "/web/identifierUserAssignment/{id}")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    public ResponseEntity updateProgramForWeb(@RequestBody IdentifierUserAssignmentContractWeb request,
                                              @PathVariable("id") Long id) {
        IdentifierUserAssignment identifierUserAssignment = identifierUserAssignmentRepository.findOne(id);
        if (identifierUserAssignment == null)
            return ResponseEntity.badRequest()
                    .body(ReactAdminUtil.generateJsonError(String.format("Identifier source with id '%d' not found", id)));

        identifierUserAssignment.setAssignedTo(request.getUserId() == null ? null : userRepository.findOne(request.getUserId()));
        identifierUserAssignment.setIdentifierSource(request.getIdentifierSourceId() == null ? null : identifierSourceRepository.findOne(request.getIdentifierSourceId()));
        identifierUserAssignment.setIdentifierStart(request.getIdentifierStart());
        identifierUserAssignment.setIdentifierEnd(request.getIdentifierEnd());
        identifierUserAssignment.setVoided(request.isVoided());
        identifierUserAssignmentRepository.save(identifierUserAssignment);
        return ResponseEntity.ok(IdentifierUserAssignmentContractWeb.fromIdentifierUserAssignment(identifierUserAssignment));
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
