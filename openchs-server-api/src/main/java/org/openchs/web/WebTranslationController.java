package org.openchs.web;

import org.openchs.dao.OrganisationConfigRepository;
import org.openchs.domain.JsonObject;
import org.openchs.domain.Organisation;
import org.openchs.domain.OrganisationConfig;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.service.TranslationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Map;

@RestController
public class WebTranslationController {

    private final TranslationService translationService;
    @Autowired
    WebTranslationController(TranslationService translationService) {
        this.translationService = translationService;
    }

    @RequestMapping(value = "/web/translations", method = RequestMethod.GET)
    public ResponseEntity<?> translationInfo(@RequestParam(value = "locale",required = false) String locale) throws IOException {

        Map<String, Map<String, JsonObject>> translationLanguage = translationService.createTransactionAndPlatformTransaction(locale);
        if (translationLanguage == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().body(translationLanguage);
    }
}