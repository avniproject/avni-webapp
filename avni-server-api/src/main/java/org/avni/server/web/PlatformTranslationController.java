package org.avni.server.web;

import org.avni.server.domain.CHSEntity;
import org.joda.time.DateTime;
import org.avni.server.application.Platform;
import org.avni.server.dao.PlatformTranslationRepository;
import org.avni.server.domain.Locale;
import org.avni.server.domain.PlatformTranslation;
import org.avni.server.web.request.TranslationRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;

@RestController
public class PlatformTranslationController implements RestControllerResourceProcessor<PlatformTranslation> {

    private final PlatformTranslationRepository platformTranslationRepository;
    private final Logger logger;

    public PlatformTranslationController(PlatformTranslationRepository platformTranslationRepository) {
        this.platformTranslationRepository = platformTranslationRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/platformTranslation", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    public ResponseEntity<?> uploadPlatformTranslations(@RequestBody TranslationRequest request) {
        Platform platform = Platform.valueOf(request.getPlatform());
        Locale language = Locale.valueOf(request.getLanguage());
        PlatformTranslation platformTranslation = platformTranslationRepository.findByPlatformAndLanguage(platform, language);
        if (platformTranslation == null) {
            platformTranslation = new PlatformTranslation();
        }
        platformTranslation.setTranslationJson(request.getTranslations());
        platformTranslation.assignUUIDIfRequired();
        platformTranslation.setPlatform(platform);
        platformTranslation.setLanguage(language);
        platformTranslation.updateAudit();
        platformTranslationRepository.save(platformTranslation);
        logger.info(String.format("Saved Translation with UUID: %s", platformTranslation.getUuid()));
        return new ResponseEntity<>(true, HttpStatus.OK);
    }

    @RequestMapping(value = "/platformTranslation/search/lastModified", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
    public PagedResources<Resource<PlatformTranslation>> get(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(platformTranslationRepository.findByPlatformAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(Platform.Android, CHSEntity.toDate(lastModifiedDateTime), CHSEntity.toDate(now), pageable));
    }

}
