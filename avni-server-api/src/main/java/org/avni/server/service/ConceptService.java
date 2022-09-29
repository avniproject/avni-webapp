package org.avni.server.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.avni.server.application.FormElement;
import org.avni.server.dao.*;
import org.avni.server.dao.application.FormElementRepository;
import org.avni.server.domain.*;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.util.BadRequestError;
import org.avni.server.util.O;
import org.avni.server.util.ObjectMapperSingleton;
import org.avni.server.util.S;
import org.avni.server.web.request.ConceptContract;
import org.avni.server.web.request.ReferenceDataContract;
import org.avni.server.web.request.application.ConceptUsageContract;
import org.avni.server.web.request.application.FormUsageContract;
import org.avni.server.web.response.Response;
import org.avni.server.web.validation.ValidationException;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.validation.constraints.NotNull;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;


@Service
public class ConceptService implements NonScopeAwareService {
    private final Logger logger;
    private ConceptRepository conceptRepository;
    private ConceptAnswerRepository conceptAnswerRepository;
    private OrganisationRepository organisationRepository;
    private FormElementRepository formElementRepository;
    private AnswerConceptMigrationRepository answerConceptMigrationRepository;
    private LocationRepository locationRepository;

    @Autowired
    public ConceptService(ConceptRepository conceptRepository, ConceptAnswerRepository conceptAnswerRepository, OrganisationRepository organisationRepository, UserService userService, FormElementRepository formElementRepository, AnswerConceptMigrationRepository answerConceptMigrationRepository, LocationRepository locationRepository) {
        this.formElementRepository = formElementRepository;
        this.answerConceptMigrationRepository = answerConceptMigrationRepository;
        this.locationRepository = locationRepository;
        logger = LoggerFactory.getLogger(this.getClass());
        this.conceptRepository = conceptRepository;
        this.conceptAnswerRepository = conceptAnswerRepository;
        this.organisationRepository = organisationRepository;
    }

    private static Map<String, String> readMap(String concepts) throws IOException {
        Map<String, String> jsonMap = new HashMap<>();
        ObjectMapper objectMapper = ObjectMapperSingleton.getObjectMapper();
        if (!S.isEmpty(concepts)) {
            jsonMap = objectMapper.readValue(concepts, new TypeReference<Map<String, String>>() {
            });
        }
        return jsonMap;
    }

    private Concept fetchOrCreateConcept(String uuid) {
        Concept concept = conceptRepository.findByUuid(uuid);
        if (concept == null) {
            concept = createConcept(uuid);
        }
        return concept;
    }

    private Concept createConcept(String uuid) {
        Concept concept = new Concept();
        concept.setUuid(uuid);
        return concept;
    }

    private boolean conceptExistsWithSameNameAndDifferentUUID(ConceptContract conceptRequest) {
        Concept concept = conceptRepository.findByName(conceptRequest.getName());
        return concept != null && !concept.getUuid().equals(conceptRequest.getUuid());
    }

    private ConceptAnswer fetchOrCreateConceptAnswer(Concept concept, ConceptContract answerConceptRequest, double answerOrder) throws AnswerConceptNotFoundException {
        if (StringUtils.isEmpty(answerConceptRequest.getUuid())) {
            throw new ValidationException("UUID missing for answer");
        }
        ConceptAnswer conceptAnswer = concept.findConceptAnswerByConceptUUID(answerConceptRequest.getUuid());
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        if (conceptAnswer == null) {
            conceptAnswer = new ConceptAnswer();
            conceptAnswer.assignUUID();
        }
        Concept answerConcept = conceptRepository.findByUuid(answerConceptRequest.getUuid());
        if (answerConcept == null) {
            String message = String.format("Answer concept not found for UUID:%s", answerConceptRequest.getUuid());
            logger.error(message);
            throw new AnswerConceptNotFoundException(message);
        }
        updateOrganisationIfNeeded(conceptAnswer, answerConceptRequest);
        if (!conceptAnswer.editableBy(organisation.getId())) {
            return conceptAnswer;
        }
        conceptAnswer.setAnswerConcept(answerConcept);
//        conceptAnswer.setAnswerConcept(map(answerConceptRequest));
        conceptAnswer.setVoided(answerConceptRequest.isVoided());
        Double providedOrder = answerConceptRequest.getOrder();
        conceptAnswer.setOrder(providedOrder == null ? answerOrder : providedOrder);
        conceptAnswer.setAbnormal(answerConceptRequest.isAbnormal());
        conceptAnswer.setUnique(answerConceptRequest.isUnique());
        return conceptAnswer;
    }

    private Concept createCodedConcept(Concept concept, ConceptContract conceptRequest) throws AnswerConceptNotFoundException {
        List<ConceptContract> answers = (List<ConceptContract>) O.coalesce(conceptRequest.getAnswers(), new ArrayList<>());
        AtomicInteger index = new AtomicInteger(0);
        List<ConceptAnswer> conceptAnswers = new ArrayList<>();
        for (ConceptContract answerContract : answers) {
            ConceptAnswer conceptAnswer = fetchOrCreateConceptAnswer(concept, answerContract, (short) index.incrementAndGet());
            conceptAnswers.add(conceptAnswer);
        }
        concept.addAll(conceptAnswers);
        return concept;
    }

    private Concept createNumericConcept(Concept concept, ConceptContract conceptRequest) {
        concept.setHighAbsolute(conceptRequest.getHighAbsolute());
        concept.setLowAbsolute(conceptRequest.getLowAbsolute());
        concept.setHighNormal(conceptRequest.getHighNormal());
        concept.setLowNormal(conceptRequest.getLowNormal());
        concept.setUnit(conceptRequest.getUnit());
        return concept;
    }

    private String getImpliedDataType(ConceptContract conceptContract, Concept concept) {
        if (conceptContract.getDataType() == null) {
            return concept.isNew() ? ConceptDataType.NA.toString() : concept.getDataType();
        }
        return conceptContract.getDataType();
    }

    private Concept map(@NotNull ConceptContract conceptRequest) throws AnswerConceptNotFoundException {
        Concept concept = fetchOrCreateConcept(conceptRequest.getUuid());

        concept.setName(conceptRequest.getName() != null ? conceptRequest.getName() : concept.getName());
        String impliedDataType = getImpliedDataType(conceptRequest, concept);
        concept.setDataType(impliedDataType);
        concept.setVoided(conceptRequest.isVoided());
        concept.setActive(conceptRequest.getActive());
        concept.setKeyValues(conceptRequest.getKeyValues());
        updateOrganisationIfNeeded(concept, conceptRequest);
        concept.updateAudit();
        switch (ConceptDataType.valueOf(impliedDataType)) {
            case Coded:
                concept = createCodedConcept(concept, conceptRequest);
                break;
            case Numeric:
                concept = createNumericConcept(concept, conceptRequest);
                break;
        }
        return concept;
    }

    private <OAE extends OrganisationAwareEntity> OAE updateOrganisationIfNeeded(@NotNull OAE entity, @NotNull ConceptContract conceptRequest) {
        String organisationUuid = conceptRequest.getOrganisationUUID();
        Organisation organisation = organisationRepository.findByUuid(organisationUuid);
        if (organisationUuid != null && organisation == null) {
            throw new RuntimeException(String.format("Organisation not found with uuid :'%s'", organisationUuid));
        }
        if (organisation != null) {
            entity.setOrganisationId(organisation.getId());
        }
        return entity;
    }

    private Concept saveOrUpdate(ConceptContract conceptRequest) throws AnswerConceptNotFoundException {
        if (conceptRequest == null) return null;
        if (conceptExistsWithSameNameAndDifferentUUID(conceptRequest)) {
            throw new BadRequestError(String.format("Concept %s exists with different uuid", conceptRequest.getName()));
        }
        logger.info(String.format("Creating concept: %s", conceptRequest.toString()));

        addToMigrationIfRequired(conceptRequest);
        Concept concept = map(conceptRequest);
        return conceptRepository.save(concept);
    }

    private void addToMigrationIfRequired(ConceptContract conceptRequest) {
        Concept concept = conceptRepository.findByUuid(conceptRequest.getUuid());
        boolean isNa = conceptRequest.getDataType() == null || conceptRequest.getDataType().equals(ConceptDataType.NA.name());
        if ( isNa && concept != null && !concept.getName().equals(conceptRequest.getName())) {
            List<ConceptAnswer> conceptAnswers = conceptAnswerRepository.findByAnswerConcept(concept);
            List<AnswerConceptMigration> answerConceptMigrations = conceptAnswers.stream().map(ca -> {
                AnswerConceptMigration answerConceptMigration = new AnswerConceptMigration();
                answerConceptMigration.setConcept(ca.getConcept());
                answerConceptMigration.setOldAnswerConceptName(concept.getName());
                answerConceptMigration.setNewAnswerConceptName(conceptRequest.getName());
                answerConceptMigration.assignUUID();
                return answerConceptMigration;
            }).collect(Collectors.toList());
            answerConceptMigrationRepository.saveAll(answerConceptMigrations);
        }
    }

    public void saveOrUpdateConcepts(List<ConceptContract> conceptRequests) {
        List<ConceptContract> failedDueToAnswerConceptNotFound = new ArrayList<>();
        for (ConceptContract conceptRequest : conceptRequests) {
            try {
                saveOrUpdate(conceptRequest);
            } catch (AnswerConceptNotFoundException answerConceptNotFoundException) {
                failedDueToAnswerConceptNotFound.add(conceptRequest);
            }
        }

        //Retry
        for (ConceptContract conceptRequest : failedDueToAnswerConceptNotFound) {
            List<ConceptContract> requestAnswers = conceptRequest.getAnswers();
            try {
                for (ConceptContract requestAnswer : requestAnswers) {
                    Optional<ConceptContract> answerConcept = failedDueToAnswerConceptNotFound.stream()
                            .filter(conceptContract -> conceptContract.getUuid().equals(requestAnswer.getUuid()))
                            .findFirst();
                    if (answerConcept.isPresent()) {
                        saveOrUpdate(answerConcept.get());
                    }
                }
                saveOrUpdate(conceptRequest);
            } catch (AnswerConceptNotFoundException answerConceptNotFoundException) {
                throw new ValidationException(answerConceptNotFoundException.getMessage());
            }

        }
    }

    public Concept get(String uuid) {
        return conceptRepository.findByUuid(uuid);
    }

    public ConceptAnswer getAnswer(String conceptUUID, String conceptAnswerUUID) {
        Concept concept = this.get(conceptUUID);
        Concept answerConcept = this.get(conceptAnswerUUID);
        return conceptAnswerRepository.findByConceptAndAnswerConcept(concept, answerConcept);
    }

    /**
     * Important: Not to be used in any Internal API calls
     */
    public Object getObservationValue(Map<String, String> conceptMap, Object value) {
        if (value instanceof ArrayList) {
            List<Object> elements = (List<Object>) value;
            return elements.stream().map(element -> {
                if (element != null && element instanceof String) {
                    return conceptMap.getOrDefault(element, (String) element);
                } else if( element != null && element instanceof HashMap) {
                    LinkedHashMap<String, Object> observationResponse = new LinkedHashMap<>();
                    Response.mapObservations(conceptRepository, this, observationResponse,
                            new ObservationCollection((HashMap<String, Object>) element));
                    return observationResponse;
                } else {
                    return conceptMap.getOrDefault(element, element.toString());
                }
            }).toArray();
        } else if( value instanceof ObservationCollection) {
            LinkedHashMap<String, Object> observationResponse = new LinkedHashMap<>();
            Response.mapObservations(conceptRepository, this, observationResponse, (ObservationCollection) value);
            return observationResponse;
        } else {
            String conceptName = conceptMap.get(value);
            return conceptName == null ? checkAndReturnLocationAddress(value) : conceptName;
        }
    }

    private Object checkAndReturnLocationAddress(Object value) {
        if(value != null && value instanceof String) {
            LinkedHashMap<String, String> location = new LinkedHashMap<>();
            AddressLevel addressLevel = locationRepository.findByLegacyIdOrUuid((String) value);
            if(addressLevel == null) {
                return value;
            }
            while (addressLevel != null) {
                putAddressLevel(location, addressLevel);
                addressLevel = addressLevel.getParent();
            }
            return location;
        } else {
            return value;
        }
    }

    private static void putAddressLevel(Map<String, String> map, AddressLevel addressLevel) {
        map.put(addressLevel.getTypeString(), addressLevel.getTitle());
    }

    public void addDependentConcepts(ConceptUsageContract conceptUsageContract, Concept answerConcept) {
        List<ConceptAnswer> conceptAnswers = conceptAnswerRepository.findByAnswerConcept(answerConcept);
        conceptAnswers.forEach(ca -> {
            ReferenceDataContract conceptContract = new ReferenceDataContract();
            Concept concept = ca.getConcept();
            conceptContract.setName(concept.getName());
            conceptContract.setId(concept.getId());
            conceptContract.setUuid(concept.getUuid());
            conceptUsageContract.addConcepts(conceptContract);
            addDependentFormDetails(conceptUsageContract, concept);
        });
    }

    public void addDependentFormDetails(ConceptUsageContract conceptUsageContract, Concept concept) {
        List<FormElement> formElements = formElementRepository.findAllByConceptUuidAndIsVoidedFalse(concept.getUuid());
        formElements.forEach(formElement -> conceptUsageContract.addForms(FormUsageContract.fromEntity(formElement)));
    }

    public Map<Concept, String> readConceptsFromJsonObject(String jsonObject) {
        Map<Concept, String> jsonMap = new HashMap<>();
        try {
            Map<String, String> conceptsMap = readMap(jsonObject);
            for (Map.Entry<String, String> entry : conceptsMap.entrySet()) {
                String conceptName = entry.getKey();
                String value = entry.getValue();
                Concept concept = conceptRepository.findByName(conceptName);
                if (concept == null)
                    throw new BadRequestError("Bad Request: One of the specified concept(%s) does not exist", conceptName);
                jsonMap.put(concept, value);
            }
            return jsonMap;
        } catch (IOException e) {
            throw new BadRequestError("Bad Request: concepts parameter is not a valid json object");
        }
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return conceptRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}
