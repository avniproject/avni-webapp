package org.avni.service;

import org.joda.time.DateTime;
import org.avni.dao.PlatformTranslationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PlatformTranslationService implements NonScopeAwareService {

    private final PlatformTranslationRepository platformTranslationRepository;

    @Autowired
    public PlatformTranslationService(PlatformTranslationRepository platformTranslationRepository) {
        this.platformTranslationRepository = platformTranslationRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return platformTranslationRepository.existsByAuditLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}

