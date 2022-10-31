package org.avni.server.web;

import org.avni.server.dao.OrganisationConfigRepository;
import org.avni.server.domain.JsonObject;
import org.avni.server.domain.Organisation;
import org.avni.server.domain.OrganisationConfig;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.service.TranslationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.*;

@RestController
public class WebTranslationController {

    private final TranslationService translationService;
    private final OrganisationConfigRepository organisationConfigRepository;

    @Autowired
    WebTranslationController(TranslationService translationService, OrganisationConfigRepository organisationConfigRepository) {
        this.translationService = translationService;
        this.organisationConfigRepository = organisationConfigRepository;
    }

    @RequestMapping(value = "/web/translations", method = RequestMethod.GET)
    public ResponseEntity<?> translationInfo(@RequestParam(value = "locale", required = false) String locale) throws IOException {
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        if (organisation == null) {
            return ResponseEntity.ok().body(new HashMap<>());
        }
        OrganisationConfig organisationConfig = organisationConfigRepository.findByOrganisationId(organisation.getId());
        Map<String, Map<String, JsonObject>> translationLanguage = translationService.createTransactionAndPlatformTransaction(locale, organisationConfig);
        return translationLanguage == null ? ResponseEntity.notFound().build() : ResponseEntity.ok().body(translationLanguage);
    }
}
