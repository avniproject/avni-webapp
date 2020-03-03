package org.openchs.web;

import org.openchs.domain.Organisation;
import org.openchs.domain.OrganisationConfig;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.projection.IndividualWebProjection;
import org.openchs.projection.OrganisationConfigProjection;
import org.openchs.service.TranslationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
public class WebTranslationController {

    private final Logger logger;
    private final TranslationService translationService;
    private final ProjectionFactory projectionFactory;

    @Autowired
    WebTranslationController(TranslationService translationService,ProjectionFactory projectionFactory) {
        this.translationService = translationService;
        logger = LoggerFactory.getLogger(this.getClass());
        this.projectionFactory = projectionFactory;
    }

    @RequestMapping(value = "/web/organizations", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public ResponseEntity<?> getOrganisationConfig() throws IOException {
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        OrganisationConfig organisationConfig = translationService.getOrganisationConfigById(organisation);

        if (organisationConfig == null) {
            return ResponseEntity.notFound().build();
        }
        return  ResponseEntity.ok().body(projectionFactory.createProjection(OrganisationConfigProjection.class, organisationConfig));
    }

    @RequestMapping(value = "/web/translations", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public ResponseEntity<?> translationInfo(@RequestParam(value = "locale",required = false) String locale) throws IOException {
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        OrganisationConfig organisationConfig = translationService.getOrganisationConfigById(organisation);

        Object translationLanguage = translationService.createTransactionAndPlatformTransaction(organisationConfig,locale);
        if (translationLanguage == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().body(translationLanguage);
    }
}