package org.openchs.service;

import org.openchs.dao.OrganisationConfigRepository;
import org.openchs.dao.PlatformTranslationRepository;
import org.openchs.dao.TranslationRepository;
import org.openchs.domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Service
public class TranslationService {
    private final TranslationRepository translationRepository;
    private final OrganisationConfigRepository organisationConfigRepository;
    private final PlatformTranslationRepository platformTranslationRepository;

    @Autowired
    public TranslationService(TranslationRepository translationRepository, OrganisationConfigRepository organisationConfigRepository,PlatformTranslationRepository platformTranslationRepository) {
        this.translationRepository = translationRepository;
        this.organisationConfigRepository = organisationConfigRepository;
        this.platformTranslationRepository = platformTranslationRepository;
    }

    public OrganisationConfig getOrganiastionConfigById(Organisation organisation){
        return organisationConfigRepository.findByOrganisationId(organisation.getId());
    }

    public Map<String,Object> createTransactionAndPlatformTransaction(OrganisationConfig organisationConfig, String locale) throws IOException {
        ArrayList<String> languages = (ArrayList<String>) organisationConfig.getSettings().get("languages");
        ArrayList<String> localeLanguages = new ArrayList<>();
        localeLanguages.addAll(languages);
        if(!Objects.nonNull(localeLanguages)){
            return null;
        }
        if(locale != null && !localeLanguages.contains(locale)){
            return null;
        }if(locale != null && localeLanguages.contains(locale)){
            localeLanguages.clear();
            localeLanguages.add(locale);
        }
        Map<String,Object> responseObject = new HashMap<>();
        for(String language : localeLanguages){
            if(!responseObject.containsKey(language)){
                Map<String,Object> translationMap = new HashMap<>();
                Translation translation = translationRepository.findByOrganisationIdAndLanguage(organisationConfig.getOrganisationId(), Locale.valueOf(language));
                PlatformTranslation platformTranslation = platformTranslationRepository.findByLanguage(Locale.valueOf(language));
                if(Objects.nonNull(translation) && Objects.nonNull(platformTranslation)) {
                    JsonObject platformTranslationMap = platformTranslation.getTranslationJson();
                    translation.getTranslationJson().entrySet().stream().forEach(entry -> {
                        platformTranslationMap.put(entry.getKey(),entry.getValue());
                    });
                    translationMap.put("translations", platformTranslationMap);
                    responseObject.put(language, translationMap);
                }else if(Objects.nonNull(translation) ){
                    translationMap.put("translations", translation.getTranslationJson());
                    responseObject.put(language, translationMap);
                }else if(Objects.nonNull(platformTranslation) ){
                    translationMap.put("translations", platformTranslation.getTranslationJson());
                    responseObject.put(language,translationMap);
                }
            }
        }
        return responseObject;
    }
}
