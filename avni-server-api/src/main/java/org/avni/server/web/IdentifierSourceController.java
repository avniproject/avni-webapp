package org.avni.server.web;

import org.avni.server.dao.CatchmentRepository;
import org.avni.server.dao.IdentifierSourceRepository;
import org.avni.server.domain.CHSEntity;
import org.avni.server.domain.IdentifierSource;
import org.avni.server.domain.User;
import org.joda.time.DateTime;
import org.avni.server.service.UserService;
import org.avni.server.web.request.IdentifierSourceContract;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;

@RestController
public class IdentifierSourceController extends AbstractController<IdentifierSource> implements RestControllerResourceProcessor<IdentifierSource> {
    private IdentifierSourceRepository identifierSourceRepository;

    private static org.slf4j.Logger logger = LoggerFactory.getLogger(IndividualController.class);
    private UserService userService;
    private CatchmentRepository catchmentRepository;

    @Autowired
    public IdentifierSourceController(IdentifierSourceRepository identifierSourceRepository, UserService userService, CatchmentRepository catchmentRepository) {
        this.identifierSourceRepository = identifierSourceRepository;
        this.userService = userService;
        this.catchmentRepository = catchmentRepository;
    }

    @RequestMapping(value = "/identifierSource/search/lastModified", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<IdentifierSource>> get(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        User currentUser = userService.getCurrentUser();
        return wrap(identifierSourceRepository.getAllAuthorisedIdentifierSources(currentUser.getCatchment(), CHSEntity.toDate(lastModifiedDateTime), CHSEntity.toDate(now), pageable));
    }

    @RequestMapping(value = "/identifierSource", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    void save(@RequestBody List<IdentifierSourceContract> identifierSourceRequests) {
        identifierSourceRequests.forEach(this::save);
    }

    void save(IdentifierSourceContract identifierSourceContract) {
        IdentifierSource identifierSource = newOrExistingEntity(identifierSourceRepository, identifierSourceContract, new IdentifierSource());
        identifierSource.setBatchGenerationSize(identifierSourceContract.getBatchGenerationSize());
        identifierSource.setCatchment(catchmentRepository.findByUuid(identifierSourceContract.getCatchmentUUID()));
        identifierSource.setMinimumBalance(identifierSourceContract.getMinimumBalance());
        identifierSource.setName(identifierSourceContract.getName());
        identifierSource.setOptions(identifierSourceContract.getOptions());
        identifierSource.setType(identifierSourceContract.getType());
        identifierSource.setVoided(identifierSourceContract.isVoided());
        identifierSource.setMinLength(identifierSourceContract.getMinLength());
        identifierSource.setMaxLength(identifierSourceContract.getMaxLength());

        identifierSourceRepository.save(identifierSource);
    }
}
