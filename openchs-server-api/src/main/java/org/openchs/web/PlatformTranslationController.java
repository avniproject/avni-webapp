package org.openchs.web;

import org.openchs.application.Platform;
import org.openchs.dao.PlatformTranslationRepository;
import org.openchs.domain.Locale;
import org.openchs.domain.Organisation;
import org.openchs.domain.PlatformTranslation;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.web.request.TranslationRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.transaction.Transactional;

@RepositoryRestController
public class PlatformTranslationController implements RestControllerResourceProcessor<PlatformTranslation> {

    private final PlatformTranslationRepository platformTranslationRepository;
    private final Logger logger;

    public PlatformTranslationController(PlatformTranslationRepository platformTranslationRepository) {
        this.platformTranslationRepository = platformTranslationRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/platformTranslation", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    public ResponseEntity<?> uploadPlatformTranslations(@RequestBody TranslationRequest request) {
        Platform platform = Platform.valueOf(request.getPlatform());
        Locale language = Locale.valueOf(request.getLanguage());
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        PlatformTranslation platformTranslation = platformTranslationRepository.findByPlatformAndLanguage(platform, language);
        if (platformTranslation == null) {
            platformTranslation = new PlatformTranslation();
        }
        platformTranslation.setTranslationJson(request.getTranslations());
        platformTranslation.assignUUIDIfRequired();
        platformTranslation.setPlatform(platform);
        platformTranslation.setLanguage(language);
        platformTranslation.setOrganisationId(organisation.getId());
        platformTranslationRepository.save(platformTranslation);
        logger.info(String.format("Saved Translation with UUID: %s", platformTranslation.getUuid()));
        return new ResponseEntity<>(true, HttpStatus.OK);
    }

}
