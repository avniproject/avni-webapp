package org.openchs.web;

import org.springframework.web.bind.annotation.RestController;
import org.openchs.dao.IdentifierSourceRepository;
import org.openchs.dao.IdentifierUserAssignmentRepository;
import org.openchs.dao.UserRepository;
import org.openchs.domain.IdentifierUserAssignment;
import org.openchs.util.ReactAdminUtil;
import org.openchs.web.request.webapp.IdentifierUserAssignmentContractWeb;
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
import javax.transaction.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
public class IdentifierUserAssignmentWebController extends AbstractController<IdentifierUserAssignment> implements RestControllerResourceProcessor<IdentifierUserAssignment> {
    private IdentifierUserAssignmentRepository identifierUserAssignmentRepository;
    private UserRepository userRepository;
    private IdentifierSourceRepository identifierSourceRepository;

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
