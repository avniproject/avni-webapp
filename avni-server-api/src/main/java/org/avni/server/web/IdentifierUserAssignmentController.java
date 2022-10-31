package org.avni.server.web;

import org.avni.server.dao.IdentifierSourceRepository;
import org.avni.server.dao.IdentifierUserAssignmentRepository;
import org.avni.server.dao.UserRepository;
import org.avni.server.domain.IdentifierUserAssignment;
import org.avni.server.web.request.IdentifierUserAssignmentContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;
import java.util.List;

@RestController
public class IdentifierUserAssignmentController extends AbstractController<IdentifierUserAssignment> {
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

}
