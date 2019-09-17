package org.openchs.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.openchs.application.Platform;
import org.openchs.dao.*;
import org.openchs.dao.application.FormElementGroupRepository;
import org.openchs.dao.application.FormElementRepository;
import org.openchs.dao.application.FormRepository;
import org.openchs.domain.JsonObject;
import org.openchs.domain.Organisation;
import org.openchs.domain.OrganisationConfig;
import org.openchs.domain.Translation;
import org.openchs.framework.security.UserContextHolder;
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
import org.springframework.web.multipart.MultipartFile;

import javax.transaction.Transactional;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    public ResponseEntity<?> uploadTranslations(@RequestBody JsonObject translations) {
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        Translation translation = translationRepository.findByOrganisationId(organisation.getId());
        if (translation == null) {
            translation = new Translation();
        }
        translation.setTranslationJson(translations);
        translation.assignUUIDIfRequired();
        translationRepository.save(translation);
        logger.info(String.format("Saved Translation with UUID: %s", translation.getUuid()));
        return new ResponseEntity<>(true, HttpStatus.OK);
    }

    @RequestMapping(value = "/translation", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    public ResponseEntity<?> downloadTranslations(@RequestParam(value = "platform") String platform) {
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        Translation translation = translationRepository.findByOrganisationId(organisation.getId());
        if (translation == null) {
            OrganisationConfig organisationConfig = organisationConfigRepository.findAll().stream().findFirst().orElse(null);
            if (organisationConfig == null) {
                return ResponseEntity.badRequest().body(String.format("Organisation configuration not set for %s. Unable to fetch data", organisation.getName()));
            }
            logger.info(String.format("Translation for organisation '%s' not found, creating empty translation file", organisation.getName()));

            JsonObject jsonObject = new JsonObject();
            JsonObject platformTranslations = platformTranslationRepository.findByPlatform(Platform.valueOf(platform)).getTranslationJson();
            ((List<String>) organisationConfig.getSettings().get("languages"))
                    .forEach(language -> {
                        Map<String, String> emptyTranslations = generateEmptyTranslations();
                        emptyTranslations.putAll((Map<String, String>) platformTranslations.get(language));
                        jsonObject.with(language, emptyTranslations);
                    });
            return ResponseEntity.ok().body(jsonObject);
        }
        return ResponseEntity.ok().body(translation.getTranslationJson());
    }

    private Map<String, String> generateEmptyTranslations() {
        Map<String, String> result = new HashMap<>();
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