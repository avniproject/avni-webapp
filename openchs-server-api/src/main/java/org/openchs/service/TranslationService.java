package org.openchs.service;

import org.openchs.application.Platform;
import org.openchs.dao.PlatformTranslationRepository;
import org.openchs.dao.TranslationRepository;
import org.openchs.domain.*;
import org.openchs.domain.Locale;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class TranslationService {
    private final TranslationRepository translationRepository;
    private final PlatformTranslationRepository platformTranslationRepository;

    @Autowired
    public TranslationService(TranslationRepository translationRepository, PlatformTranslationRepository platformTranslationRepository) {
        this.translationRepository = translationRepository;
        this.platformTranslationRepository = platformTranslationRepository;
    }

    public Map<String, Map<String, JsonObject>> createTransactionAndPlatformTransaction(String locale, OrganisationConfig organisationConfig) {
        if (organisationConfig != null && organisationConfig.getSettings() != null) {
            List<String> allSupportedLanguages = (ArrayList<String>) organisationConfig.getSettings().get("languages");
            Set<String> languages = new HashSet<>(allSupportedLanguages);
            if (locale != null) {
                return getSingleLanguageTranslation(languages, locale, organisationConfig);
            }
            return getMergedTranslations(languages, organisationConfig);
        }
        return new HashMap<>();
    }

    private Map<String, Map<String, JsonObject>> getSingleLanguageTranslation(Set<String> allLanguages, String passedLanguage, OrganisationConfig organisationConfig) {
        if (!allLanguages.contains(passedLanguage)) {
            return null;
        }
        allLanguages.clear();
        allLanguages.add(passedLanguage);
        return getMergedTranslations(allLanguages, organisationConfig);
    }

    private Map<String, Map<String, JsonObject>> getMergedTranslations(Set<String> languages, OrganisationConfig organisationConfig) {
        Map<String, Map<String, JsonObject>> responseMap = new HashMap<>();
        for (String language : languages) {
            Map<String, JsonObject> translationMap = new HashMap<>();
            Translation implementationTranslations = translationRepository.findByOrganisationIdAndLanguage(organisationConfig.getOrganisationId(), Locale.valueOf(language));
            PlatformTranslation platformTranslation = platformTranslationRepository.findByPlatformAndLanguage(Platform.Web, Locale.valueOf(language));
            JsonObject jsonObject = new JsonObject();
            if (platformTranslation != null) {
                jsonObject.putAll(platformTranslation.getTranslationJson());
            } if (implementationTranslations != null) {
                jsonObject.putAll(implementationTranslations.getTranslationJson());
            }
            translationMap.put("translations", jsonObject);
            responseMap.put(language, translationMap);
        }
        return responseMap;
    }
}
