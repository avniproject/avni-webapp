package org.openchs.web;

import org.openchs.application.Platform;
import org.openchs.dao.*;
import org.openchs.dao.application.FormElementGroupRepository;
import org.openchs.dao.application.FormElementRepository;
import org.openchs.dao.application.FormRepository;
import org.openchs.domain.Locale;
import org.openchs.domain.*;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.web.request.TranslationRequest;
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
                          PlatformTranslationRepository platformTranslationRepository) {
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
        translationRepository.save(translation);
        logger.info(String.format("Saved Translation with UUID: %s", translation.getUuid()));
        return new ResponseEntity<>(true, HttpStatus.OK);
    }

    @RequestMapping(value = "/translation", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    public ResponseEntity<?> downloadTranslations(@RequestParam(value = "platform") String platform) {
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        List<Translation> translations = translationRepository.findAll();
        if (translations.isEmpty()) {
            OrganisationConfig organisationConfig = organisationConfigRepository.findAll().stream().findFirst().orElse(null);
            if (organisationConfig == null) {
                return ResponseEntity.badRequest().body(String.format("Organisation configuration not set for %s. Unable to fetch data", organisation.getName()));
            }
            logger.info(String.format("Translation for organisation '%s' not found, creating empty translation file", organisation.getName()));

            List<Translation> emptyImplTranslations = new ArrayList<>();
            ((List<String>) organisationConfig.getSettings().get("languages"))
                    .forEach(language -> {
                        PlatformTranslation platformTranslation = platformTranslationRepository.findByPlatformAndLanguage(Platform.valueOf(platform), Locale.valueOf(language));
                        Translation translation = new Translation();
                        JsonObject jsonObject = new JsonObject(generateEmptyTranslations());
                        jsonObject.putAll(platformTranslation != null ? platformTranslation.getTranslationJson() : new HashMap<>());
                        translation.setLanguage(Locale.valueOf(language));
                        translation.setTranslationJson(jsonObject);
                        emptyImplTranslations.add(translation);

                    });
            return ResponseEntity.ok().body(emptyImplTranslations);
        }
        return ResponseEntity.ok().body(translations);
    }

    private Map<String, Object> generateEmptyTranslations() {
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
                formRepository.getAllNames()
        ).forEach(list -> list.forEach(e -> result.put(e, "")));
        return result;
    }
}