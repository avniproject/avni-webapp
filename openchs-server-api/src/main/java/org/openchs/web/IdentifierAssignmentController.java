package org.openchs.web;

import org.joda.time.DateTime;
import org.openchs.dao.IdentifierAssignmentRepository;
import org.openchs.dao.IdentifierSourceRepository;
import org.openchs.domain.Encounter;
import org.openchs.domain.IdentifierAssignment;
import org.openchs.domain.User;
import org.openchs.service.IdentifierAssignmentService;
import org.openchs.service.UserService;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;

@RestController
@Transactional
public class IdentifierAssignmentController extends AbstractController<IdentifierAssignment> implements RestControllerResourceProcessor<IdentifierAssignment> {

    private static org.slf4j.Logger logger = LoggerFactory.getLogger(IndividualController.class);
    private IdentifierAssignmentRepository identifierAssignmentRepository;
    private UserService userService;
    private IdentifierAssignmentService identifierAssignmentService;

    @Autowired
    public IdentifierAssignmentController(IdentifierAssignmentRepository identifierAssignmentRepository, IdentifierSourceRepository identifierSourceRepository, UserService userService, IdentifierAssignmentService identifierAssignmentService) {
        this.identifierAssignmentRepository = identifierAssignmentRepository;
        this.userService = userService;
        this.identifierAssignmentService = identifierAssignmentService;
    }

    /**
     * This method generates identifiers on the fly if there are missing identifiers.
     * Due to this, we do not pass the <code>now</code> parameter that is generated in
     * <code>TransactionalResourceInterceptor</code>.
     *
     * This approach is fine because we do not expect IdentifierAssignments to be shared across users.
     *
     * @param lastModifiedDateTime
     * @param pageable
     * @return
     */
    @RequestMapping(value = "/identifierAssignment", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    public PagedResources<Resource<IdentifierAssignment>> get(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            Pageable pageable) {
        User currentUser = userService.getCurrentUser();
        identifierAssignmentService.generateIdentifiersIfNecessary(currentUser);

        return wrap(identifierAssignmentRepository.findByAssignedToAndAuditLastModifiedDateTimeGreaterThanAndIsVoidedFalseAndIndividualIsNullAndProgramEnrolmentIsNullOrderByAssignmentOrderAsc(currentUser, lastModifiedDateTime, pageable));
    }

    @Override
    public Resource<IdentifierAssignment> process(Resource<IdentifierAssignment> resource) {
        IdentifierAssignment identifierAssignment = resource.getContent();
        resource.removeLinks();
        if (identifierAssignment.getProgramEnrolment() != null) {
            resource.add(new Link(identifierAssignment.getProgramEnrolment().getUuid(), "programEnrolmentUUID"));
        }
        if (identifierAssignment.getIndividual() != null) {
            resource.add(new Link(identifierAssignment.getIndividual().getUuid(), "individualUUID"));
        }
        resource.add(new Link(identifierAssignment.getIdentifierSource().getUuid(), "identifierSourceUUID"));
        return resource;
    }
}