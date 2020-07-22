package org.openchs.service;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.openchs.application.Platform;
import org.openchs.dao.PlatformTranslationRepository;
import org.openchs.dao.TranslationRepository;
import org.openchs.domain.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.initMocks;

public class TranslationServiceTest {

    @Mock
    private TranslationRepository translationRepository;

    @Mock
    private PlatformTranslationRepository platformTranslationRepository;

    private TranslationService translationService;

    @Before
    public void setup() {
        initMocks(this);
        translationService = new TranslationService(translationRepository, platformTranslationRepository);
    }

    @Test
    public void shouldReturnMergedTranslations() {
        List<String> languages = new ArrayList<>();
        languages.add("en");
        languages.add("gu_IN");
        OrganisationConfig organisationConfig = getOrganisationConfigWithLanguages(languages);

        JsonObject englishPlatformTranslations = getEnglishPlatformTranslations();
        PlatformTranslation mockedEnglishPlatformTranslations = getMockedPlatformTranslations(Locale.en, englishPlatformTranslations);
        JsonObject gujaratiPlatformTranslations = getGujaratiPlatformTranslations();
        PlatformTranslation mockedGujaratiPlatformTranslations = getMockedPlatformTranslations(Locale.gu_IN, gujaratiPlatformTranslations);

        JsonObject englishImplementationTranslations = getEnglishImplTranslations();
        Translation mockedEnglishImplementationTranslations = getMockedImplementationTranslations(Locale.en, englishImplementationTranslations);
        JsonObject gujaratiImplementationTranslations = getGujaratiImplTranslations();
        Translation mockedGujaratiImplementationTranslations = getMockedImplementationTranslations(Locale.gu_IN, gujaratiImplementationTranslations);

        mockPlatformRepository(mockedEnglishPlatformTranslations, Locale.en);
        mockTranslationRepository(mockedEnglishImplementationTranslations, Locale.en);
        mockPlatformRepository(mockedGujaratiPlatformTranslations, Locale.gu_IN);
        mockTranslationRepository(mockedGujaratiImplementationTranslations, Locale.gu_IN);

        Map<String, Map<String, JsonObject>> mergedTranslations = translationService.createTransactionAndPlatformTransaction(null, organisationConfig);
        Assert.assertNotNull(mergedTranslations.get("en"));
        Assert.assertNotNull(mergedTranslations.get("gu_IN"));
        Map<String, JsonObject> englishTranslations = mergedTranslations.get("en");

        Assert.assertEquals(2, englishTranslations.get("translations").size());
        JsonObject translations = englishTranslations.get("translations");
        Assert.assertEquals(englishPlatformTranslations.get("name"), translations.get("name"));
        Assert.assertEquals(englishImplementationTranslations.get("concept1"), translations.get("concept1"));

        JsonObject gujaratiTranslations = mergedTranslations.get("gu_IN").get("translations");
        Assert.assertEquals(gujaratiImplementationTranslations.get("concept1"), gujaratiTranslations.get("concept1"));
        Assert.assertEquals(gujaratiPlatformTranslations.get("name"), gujaratiTranslations.get("name"));
    }

    @Test
    public void shouldReturnNullIfPassedTranslationIsNotInConfig() {
        List<String> languages = new ArrayList<>();
        languages.add("mr_IN");
        OrganisationConfig organisationConfig = getOrganisationConfigWithLanguages(languages);
        Map<String, Map<String, JsonObject>> mergedTranslations = translationService.createTransactionAndPlatformTransaction("en", organisationConfig);
        Assert.assertNull(mergedTranslations);
    }

    @Test
    public void shouldReturnOnlyPassedLanguageTranslation() {
        List<String> languages = new ArrayList<>();
        languages.add("gu_IN");
        languages.add("en");
        OrganisationConfig organisationConfig = getOrganisationConfigWithLanguages(languages);

        JsonObject englishPlatformTranslations = getEnglishPlatformTranslations();
        PlatformTranslation mockedEnglishPlatformTranslations = getMockedPlatformTranslations(Locale.en, englishPlatformTranslations);
        JsonObject gujaratiPlatformTranslations = getGujaratiPlatformTranslations();
        PlatformTranslation mockedGujaratiPlatformTranslations = getMockedPlatformTranslations(Locale.gu_IN, gujaratiPlatformTranslations);

        JsonObject englishImplementationTranslations = getEnglishImplTranslations();
        Translation mockedEnglishImplementationTranslations = getMockedImplementationTranslations(Locale.en, englishImplementationTranslations);
        JsonObject gujaratiImplementationTranslations = getGujaratiImplTranslations();
        Translation mockedGujaratiImplementationTranslations = getMockedImplementationTranslations(Locale.gu_IN, gujaratiImplementationTranslations);

        mockPlatformEng(mockedEnglishPlatformTranslations);
        mockTranslationRepository(mockedEnglishImplementationTranslations, Locale.en);
        mockPlatformRepository(mockedGujaratiPlatformTranslations, Locale.gu_IN);
        mockTranslationRepository(mockedGujaratiImplementationTranslations, Locale.gu_IN);

        Map<String, Map<String, JsonObject>> mergedTranslations = translationService.createTransactionAndPlatformTransaction("gu_IN", organisationConfig);
        Assert.assertNotNull(mergedTranslations.get("gu_IN"));
        Assert.assertNull(mergedTranslations.get("en"));

        JsonObject jsonObject = mergedTranslations.get("gu_IN").get("translations");
        Assert.assertEquals(gujaratiImplementationTranslations.get("concept1"), jsonObject.get("concept1"));
        Assert.assertEquals(gujaratiPlatformTranslations.get("name"), jsonObject.get("name"));
    }

    private void mockTranslationRepository(Translation mockedEnglishImplementationTranslations, Locale en) {
        when(translationRepository.findByOrganisationIdAndLanguage(1L, en))
                .thenReturn(mockedEnglishImplementationTranslations);
    }

    private void mockPlatformEng(PlatformTranslation mockedEnglishPlatformTranslations) {
        mockPlatformRepository(mockedEnglishPlatformTranslations, Locale.en);
    }

    private JsonObject getEnglishImplTranslations() {
        JsonObject englishImplementationTranslations = new JsonObject();
        englishImplementationTranslations.put("concept1", "Concept one");
        return englishImplementationTranslations;
    }

    private JsonObject getEnglishPlatformTranslations() {
        JsonObject englishPlatformTranslations = new JsonObject();
        englishPlatformTranslations.put("name", "Name");
        return englishPlatformTranslations;
    }

    private OrganisationConfig getOrganisationConfigWithLanguages(List<String> languages) {
        OrganisationConfig organisationConfig = new OrganisationConfig();
        JsonObject jsonObject = new JsonObject();
        jsonObject.put("languages", languages);
        organisationConfig.setOrganisationId(1L);
        organisationConfig.setSettings(jsonObject);
        return organisationConfig;
    }

    private Translation getMockedImplementationTranslations(Locale locale, JsonObject translationJson) {
        Translation mockedEnglishImplementationTranslations = new Translation();
        mockedEnglishImplementationTranslations.setLanguage(locale);
        mockedEnglishImplementationTranslations.setTranslationJson(translationJson);
        return mockedEnglishImplementationTranslations;
    }

    private PlatformTranslation getMockedPlatformTranslations(Locale locale, JsonObject translationJson) {
        PlatformTranslation mockedEnglishPlatformTranslations = new PlatformTranslation();
        mockedEnglishPlatformTranslations.setLanguage(locale);
        mockedEnglishPlatformTranslations.setPlatform(Platform.Web);
        mockedEnglishPlatformTranslations.setTranslationJson(translationJson);
        return mockedEnglishPlatformTranslations;
    }

    private void mockPlatformRepository(PlatformTranslation mockedEnglishPlatformTranslations, Locale en) {
        when(platformTranslationRepository.findByPlatformAndLanguage(Platform.Web, en))
                .thenReturn(mockedEnglishPlatformTranslations);
    }

    private JsonObject getGujaratiImplTranslations() {
        JsonObject gujaratiImplementationTranslations = new JsonObject();
        gujaratiImplementationTranslations.put("concept1", "એક કલ્પના");
        return gujaratiImplementationTranslations;
    }

    private JsonObject getGujaratiPlatformTranslations() {
        JsonObject gujaratiPlatformTranslations = new JsonObject();
        gujaratiPlatformTranslations.put("name", "નામ");
        return gujaratiPlatformTranslations;
    }
}
