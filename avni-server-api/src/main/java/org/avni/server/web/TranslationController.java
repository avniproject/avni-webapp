package org.avni.server.web;

import org.avni.server.application.Platform;
import org.avni.server.dao.*;
import org.avni.server.dao.application.FormElementGroupRepository;
import org.avni.server.dao.application.FormElementRepository;
import org.avni.server.dao.application.FormRepository;
import org.avni.server.domain.*;
import org.avni.server.domain.Locale;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.web.request.TranslationContract;
import org.avni.server.web.request.TranslationRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import javax.transaction.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@RepositoryRestController
public class TranslationController implements RestControllerResourceProcessor<Translation> {

    private final TranslationRepository translationRepository;
    private final Logger logger;
    private final FormElementGroupRepository formElementGroupRepository;
    private final FormElementRepository formElementRepository;
    private final ConceptRepository conceptRepository;
    private final ConceptAnswerRepository conceptAnswerRepository;
    private final OperationalEncounterTypeRepository operationalEncounterTypeRepository;
    private final EncounterTypeRepository encounterTypeRepository;
    private final OperationalProgramRepository operationalProgramRepository;
    private final ProgramRepository programRepository;
    private final ChecklistDetailRepository checklistDetailRepository;
    private final CatchmentRepository catchmentRepository;
    private final LocationRepository locationRepository;
    private final FormRepository formRepository;
    private final OrganisationConfigRepository organisationConfigRepository;
    private final PlatformTranslationRepository platformTranslationRepository;
    private final AddressLevelTypeRepository addressLevelTypeRepository;
    private final OperationalSubjectTypeRepository operationalSubjectTypeRepository;
    private final CardRepository cardRepository;
    private final DashboardRepository dashboardRepository;
    private final String REGISTRATION_PREFIX = "REG_DISPLAY-";
    private final String ENROLMENT_PREFIX = "REG_ENROL_DISPLAY-";

    @Autowired
    TranslationController(TranslationRepository translationRepository,
                          FormElementGroupRepository formElementGroupRepository,
                          FormElementRepository formElementRepository,
                          ConceptRepository conceptRepository,
                          ConceptAnswerRepository conceptAnswerRepository,
                          OperationalEncounterTypeRepository operationalEncounterTypeRepository,
                          EncounterTypeRepository encounterTypeRepository,
                          OperationalProgramRepository operationalProgramRepository,
                          ProgramRepository programRepository,
                          ChecklistDetailRepository checklistDetailRepository,
                          CatchmentRepository catchmentRepository,
                          LocationRepository locationRepository,
                          OrganisationConfigRepository organisationConfigRepository,
                          FormRepository formRepository,
                          PlatformTranslationRepository platformTranslationRepository,
                          AddressLevelTypeRepository addressLevelTypeRepository,
                          OperationalSubjectTypeRepository operationalSubjectTypeRepository,
                          CardRepository cardRepository,
                          DashboardRepository dashboardRepository) {
        this.translationRepository = translationRepository;
        this.formElementGroupRepository = formElementGroupRepository;
        this.formElementRepository = formElementRepository;
        this.conceptRepository = conceptRepository;
        this.conceptAnswerRepository = conceptAnswerRepository;
        this.operationalEncounterTypeRepository = operationalEncounterTypeRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.operationalProgramRepository = operationalProgramRepository;
        this.programRepository = programRepository;
        this.checklistDetailRepository = checklistDetailRepository;
        this.catchmentRepository = catchmentRepository;
        this.locationRepository = locationRepository;
        this.organisationConfigRepository = organisationConfigRepository;
        this.formRepository = formRepository;
        this.platformTranslationRepository = platformTranslationRepository;
        this.addressLevelTypeRepository = addressLevelTypeRepository;
        this.operationalSubjectTypeRepository = operationalSubjectTypeRepository;
        this.cardRepository = cardRepository;
        this.dashboardRepository = dashboardRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/translation", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    public ResponseEntity<?> uploadTranslations(@RequestBody TranslationRequest request) {
        Locale language = Locale.valueOf(request.getLanguage());
        Translation translation = translationRepository.findByLanguage(language);
        if (translation == null) {
            translation = new Translation();
        }
        translation.setTranslationJson(request.getTranslations());
        translation.setLanguage(language);
        translation.assignUUIDIfRequired();
        translation.updateAudit();
        translationRepository.save(translation);
        logger.info(String.format("Saved Translation with UUID: %s", translation.getUuid()));
        return new ResponseEntity<>(true, HttpStatus.OK);
    }

    @RequestMapping(value = "/translation", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    public ResponseEntity<?> downloadTranslations(@RequestParam(value = "platform") String platform,
                                                  @RequestParam(value = "emptyValue", defaultValue = "") String valueForEmptyKey) {
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        OrganisationConfig organisationConfig = organisationConfigRepository.findAll().stream().findFirst().orElse(null);
        if (organisationConfig == null) {
            return ResponseEntity.badRequest().body(String.format("Organisation configuration not set for %s. Unable to fetch data", organisation.getName()));
        }
        List<Translation> translations = translationRepository.findAll();
        return ResponseEntity.ok().body(generateTranslations(organisationConfig, translations, Platform.valueOf(platform), valueForEmptyKey, organisation));
    }

    private List<TranslationContract> generateTranslations(OrganisationConfig organisationConfig, List<Translation> translations, Platform platform, String valueForEmptyKey, Organisation organisation) {
        List<TranslationContract> translationList = new ArrayList<>();
        Map<Locale, JsonObject> translationMap = translations.stream().collect(Collectors.toMap(Translation::getLanguage, Translation::getTranslationJson, (a, b) -> b));
        ((List<String>) organisationConfig.getSettings().get("languages"))
                .forEach(language -> {
                    JsonObject existingTranslations = translationMap.get(Locale.valueOf(language));
                    Map<String, Object> platformTranslations = generatePlatformTranslations(platform, Locale.valueOf(language), valueForEmptyKey);
                    TranslationContract translation = new TranslationContract();
                    JsonObject jsonObject = new JsonObject(generateTranslationsWithValue(valueForEmptyKey));
                    jsonObject.putAll(addRegistrationAndEnrolmentStrings());
                    jsonObject.putAll(platformTranslations);
                    jsonObject.putAll(existingTranslations != null ? existingTranslations : Collections.emptyMap());
                    translation.setLanguage(Locale.valueOf(language));
                    translation.setTranslationJson(jsonObject);
                    translationList.add(translation);
                });

        return translationList;
    }

    private Map<String, Object> generateTranslationsWithValue(String valueForEmptyKey) {
        Map<String, Object> result = new HashMap<>();
        Arrays.asList(formElementGroupRepository.getAllNames(),
                formElementRepository.getAllNames(),
                conceptRepository.getAllNames(),
                operationalEncounterTypeRepository.getAllNames(),
                encounterTypeRepository.getAllNames(),
                operationalProgramRepository.getAllNames(),
                programRepository.getAllNames(),
                checklistDetailRepository.getAllNames(),
                catchmentRepository.getAllNames(),
                locationRepository.getAllNames(),
                conceptAnswerRepository.getAllConceptNames(),
                conceptAnswerRepository.getAllNames(),
                formRepository.getAllNames(),
                addressLevelTypeRepository.getAllNames(),
                operationalSubjectTypeRepository.getAllNames(),
                cardRepository.getAllNames(),
                dashboardRepository.getAllNames()
        ).forEach(list -> list.forEach(e -> {
            if (e != null) {
                result.put(e, valueForEmptyKey);
            }
        }));
        return result;
    }

    private Map<String, Object> generatePlatformTranslations(Platform platform, Locale language, String valueForEmptyKey) {
        PlatformTranslation platformTranslation = platformTranslationRepository.findByPlatformAndLanguage(platform, language);
        PlatformTranslation englishPlatformTranslation = platformTranslationRepository.findByPlatformAndLanguage(platform, Locale.en);
        Map<String, Object> emptyEnglishTranslation = englishPlatformTranslation == null ? Collections.emptyMap() :
                englishPlatformTranslation
                        .getTranslationJson()
                        .entrySet()
                        .stream()
                        .collect(Collectors.toMap(Map.Entry::getKey, e -> valueForEmptyKey));
        if (platformTranslation == null) {
            logger.info(String.format("No platform translations found for platform: %s, language: %s", platform.name(), language.name()));
            return emptyEnglishTranslation;
        }
        JsonObject jsonObject = new JsonObject(emptyEnglishTranslation);
        jsonObject.putAll(platformTranslation.getTranslationJson());
        return jsonObject;
    }

    private Map<String, String> addRegistrationAndEnrolmentStrings() {
        Map<String, String> translations = new HashMap<>();
        operationalSubjectTypeRepository.getAllNames().forEach(subject -> translations.put(REGISTRATION_PREFIX.concat(subject), ""));
        operationalProgramRepository.getAllNames().forEach(program -> {
            if (program != null)
                translations.put(ENROLMENT_PREFIX.concat(program), "");
        });
        return translations;
    }
}
