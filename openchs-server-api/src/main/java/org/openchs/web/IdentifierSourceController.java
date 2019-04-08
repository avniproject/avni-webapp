package org.openchs.web;

import org.joda.time.DateTime;
import org.openchs.dao.*;
import org.openchs.domain.*;
import org.openchs.service.UserService;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
public class IdentifierSourceController extends AbstractController<IdentifierSource> implements RestControllerResourceProcessor<IdentifierSource> {
    private IdentifierSourceRepository identifierSourceRepository;

    private static org.slf4j.Logger logger = LoggerFactory.getLogger(IndividualController.class);
    private UserService userService;

    @Autowired
    public IdentifierSourceController(IdentifierSourceRepository identifierSourceRepository, UserService userService) {
        this.identifierSourceRepository = identifierSourceRepository;
        this.userService = userService;
    }

    @RequestMapping(value = "/identifierSource/search/lastModified", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<IdentifierSource>> get(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        User currentUser = userService.getCurrentUser();
        return wrap(identifierSourceRepository.getAllAuthorisedIdentifierSources(currentUser.getCatchment(), currentUser.getFacility(),lastModifiedDateTime, now, pageable));
    }
}