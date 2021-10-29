package org.avni.web;

import org.avni.dao.*;
import org.avni.domain.*;
import org.avni.service.UserService;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

import static org.springframework.hateoas.mvc.ControllerLinkBuilder.linkTo;

@RestController
public class SubjectMigrationController extends AbstractController<SubjectMigration> implements RestControllerResourceProcessor<SubjectMigration>, OperatingIndividualScopeAwareController<SubjectMigration> {
    private SubjectMigrationRepository subjectMigrationRepository;
    private SubjectTypeRepository subjectTypeRepository;
    private UserService userService;
    private final Logger logger;

    @Autowired
    public SubjectMigrationController(SubjectMigrationRepository subjectMigrationRepository, SubjectTypeRepository subjectTypeRepository, UserService userService) {
        logger = LoggerFactory.getLogger(this.getClass());
        this.subjectMigrationRepository = subjectMigrationRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.userService = userService;
    }

    @Override
    public OperatingIndividualScopeAwareRepository<SubjectMigration> repository() {
        return subjectMigrationRepository;
    }

    @RequestMapping(value = "/subjectMigrations", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<SubjectMigration>> getEncountersByCatchmentAndLastModified(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            @RequestParam(value = "subjectTypeUuid", required = false) String subjectTypeUuid,
            Pageable pageable) {
        if (subjectTypeUuid.isEmpty()) return wrap(new PageImpl<>(Collections.emptyList()));
        SubjectType subjectType = subjectTypeRepository.findByUuid(subjectTypeUuid);
        if (subjectType == null) return wrap(new PageImpl<>(Collections.emptyList()));

        return wrap(getCHSEntitiesForUserByLastModifiedDateTimeAndFilterByType(userService.getCurrentUser(), lastModifiedDateTime, now, subjectType.getId(), pageable));
    }

    @Override
    public Resource<SubjectMigration> process(Resource<SubjectMigration> resource) {
        SubjectMigration content = resource.getContent();
        resource.removeLinks();
        resource.add(new Link(content.getIndividual().getUuid(), "individualUUID"));
        resource.add(new Link(content.getOldAddressLevel().getUuid(), "oldAddressLevelUUID"));
        resource.add(new Link(content.getNewAddressLevel().getUuid(), "newAddressLevelUUID"));
        return resource;
    }
}
