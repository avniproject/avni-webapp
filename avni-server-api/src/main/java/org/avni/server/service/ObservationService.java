package org.avni.server.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.avni.server.dao.ConceptRepository;
import org.avni.server.dao.IndividualRepository;
import org.avni.server.dao.LocationRepository;
import org.avni.server.domain.*;
import org.avni.server.util.BadRequestError;
import org.avni.server.util.ObjectMapperSingleton;
import org.avni.server.web.request.*;
import org.avni.server.web.request.rules.RulesContractWrapper.Decision;
import org.avni.server.web.request.rules.constant.WorkFlowTypeEnum;
import org.avni.server.web.request.rules.response.KeyValueResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotNull;
import java.util.AbstractMap.SimpleEntry;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ObservationService {
    private ConceptRepository conceptRepository;
    private IndividualRepository individualRepository;
    private LocationRepository locationRepository;
    private ObjectMapper objectMapper;

    @Autowired
    public ObservationService(ConceptRepository conceptRepository, IndividualRepository individualRepository, LocationRepository locationRepository) {
        this.conceptRepository = conceptRepository;
        this.individualRepository = individualRepository;
        this.locationRepository = locationRepository;
        this.objectMapper = ObjectMapperSingleton.getObjectMapper();
    }

    public ObservationCollection createObservations(List<ObservationRequest> observationRequests) {
        Map<String, Object> completedObservationRequests = observationRequests
                .stream()
                .map(observationRequest -> {
                    Concept concept;
                    if (observationRequest.getConceptUUID() == null && observationRequest.getConceptName() != null) {
                        concept = conceptRepository.findByName(observationRequest.getConceptName());
                        if (concept == null) {
                            throw new NullPointerException(String.format("Concept with name=%s not found", observationRequest.getConceptName()));
                        }
                        String conceptUUID = concept.getUuid();
                        observationRequest.setConceptUUID(conceptUUID);
                    } else {
                        concept = conceptRepository.findByUuid(observationRequest.getConceptUUID());
                    }
                    return new SimpleEntry<>(concept, observationRequest.getValue());
                })
                .filter(obsReqAsMap -> null != obsReqAsMap.getKey()
                        && !"null".equalsIgnoreCase(String.valueOf(obsReqAsMap.getValue())))
                .peek(this::validate)
                .collect(Collectors
                        .toConcurrentMap((it -> it.getKey().getUuid()), SimpleEntry::getValue, (oldVal, newVal) -> newVal));
        return new ObservationCollection(completedObservationRequests);
    }

    public ObservationCollection createObservationsFromDecisions(List<Decision> decisions) {
        Map<String, Object> observations = new HashMap<>();
        for (Decision decision : decisions) {
            String conceptName = decision.getName();
            Concept concept = conceptRepository.findByName(conceptName);
            if (concept == null) {
                throw new NullPointerException(String.format("Concept with name=%s not found", conceptName));
            }
            String conceptUUID = concept.getUuid();
            String dataType = concept.getDataType();
            Object value;
            Object decisionValue = decision.getValue();
            switch (ConceptDataType.valueOf(dataType)) {
                case Coded: {
                    //TODO: validate that value is part of the concept answers set.
                    if (decisionValue instanceof Collection<?>) {
                        List<String> array = (List) decisionValue;
                        value = array.stream().map(answerConceptName -> {
                            Concept answerConcept = conceptRepository.findByName(answerConceptName);
                            if (answerConcept == null)
                                throw new NullPointerException(String.format("Answer concept with name=%s not found", answerConceptName));
                            return answerConcept.getUuid();
                        }).toArray();
                    } else {
                        String answerConceptName = (String) decisionValue;
                        Concept answerConcept = conceptRepository.findByName(answerConceptName);
                        if (answerConcept == null)
                            throw new NullPointerException(String.format("Answer concept with name=%s not found", answerConceptName));
                        value = answerConcept.getUuid();
                    }
                    break;
                }
                default: {
                    value = decisionValue;
                    break;
                }
            }
            observations.put(conceptUUID, value);
        }
        return new ObservationCollection(observations);
    }

    public List<ObservationContract> createObservationContractsFromKeyValueResponse(List<KeyValueResponse> keyValueResponses, WorkFlowTypeEnum workflow) {
        List<ObservationContract> observationContracts = new ArrayList<>();
        for (KeyValueResponse keyValueResponse : keyValueResponses) {
            ObservationContract observationContract = new ObservationContract();
            String conceptName = keyValueResponse.getName();
            Concept concept = conceptRepository.findByName(conceptName);
            if (concept == null) {
                throw new BadRequestError(String.format("Concept with name=%s not found", conceptName));
            }
            String dataType = concept.getDataType();
            Object value;
            Object keyValueResponseValue = keyValueResponse.getValue();
            switch (ConceptDataType.valueOf(dataType)) {
                case Coded: {
                    //TODO: validate that value is part of the concept answers set.
                    if (keyValueResponseValue instanceof Collection<?>) {
                        List<String> array = (List) keyValueResponseValue;
                        value = array.stream().map(answerConceptName -> {
                            Concept answerConcept = getConceptForValue(answerConceptName, workflow);
                            if (answerConcept == null)
                                throw new BadRequestError(String.format("Answer concept with name=%s not found", answerConceptName));
                            return answerConcept.getUuid();
                        }).toArray();
                    } else {
                        String answerConceptName = (String) keyValueResponseValue;
                        Concept answerConcept = getConceptForValue(answerConceptName, workflow);
                        if (answerConcept == null)
                            throw new BadRequestError(String.format("Answer concept with name=%s not found", answerConceptName));
                        value = answerConcept.getUuid();
                    }
                    break;
                }
                default: {
                    value = keyValueResponseValue;
                    break;
                }
            }
            observationContract.setConcept(concept.toConceptContract());
            observationContract.setValue(value);
            observationContracts.add(observationContract);
        }
        return observationContracts;
    }

    private Concept getConceptForValue(String conceptValue, WorkFlowTypeEnum workflow) {
        if(workflow.isSummaryWorkflow()){
            return conceptRepository.findByUuid(conceptValue);
        } else {
            return conceptRepository.findByName(conceptValue);
        }
    }

    public Object getObservationValue(String conceptName, ProgramEncounter programEncounter) {
        Concept concept = conceptRepository.findByName(conceptName);
        if (concept == null) return null;

        return getObservationValue(programEncounter, concept);
    }

    private Object getObservationValue(ProgramEncounter programEncounter, Concept concept) {
        if (programEncounter == null) return null;
        ObservationCollection observations = programEncounter.getObservations();
        return getObservationValue(concept, observations);
    }

    private Object getObservationValue(Concept concept, ObservationCollection observations) {
        Object storedValue = observations.get(concept.getUuid());
        if (storedValue == null) return null;
        if (concept.getDataType().equals(ConceptDataType.Coded.toString())) {
            String[] array = (String[]) storedValue;
            Object[] objects = Arrays.stream(array).map(s -> {
                Concept answerConcept = conceptRepository.findByUuid(s);
                return answerConcept.getName();
            }).toArray();
            return Arrays.asList(Arrays.copyOf(objects, objects.length, String[].class));
        }
        return storedValue;
    }

    public Object getObservationValue(String conceptName, ProgramEnrolment enrolment) {
        Concept concept = conceptRepository.findByName(conceptName);
        if (concept == null) return null;

        Object observationValue = getObservationValue(concept, enrolment.getObservations());
        if (observationValue != null) return observationValue;

        Set<ProgramEncounter> programEncounters = enrolment.getProgramEncounters();
        ProgramEncounter encounterWithObs = programEncounters.stream().filter(programEncounter -> {
            return programEncounter.getEncounterDateTime() != null;
        }).sorted((o1, o2) -> {
            return o2.getEncounterDateTime().compareTo(o1.getEncounterDateTime());
        }).filter(programEncounter -> {
            return this.getObservationValue(concept, programEncounter.getObservations()) != null;
        }).findFirst().orElse(null);
        return getObservationValue(encounterWithObs, concept);
    }

    private void validate(SimpleEntry<Concept, Object> obsReqAsMap) {
        Concept question = obsReqAsMap.getKey();
        Object value = obsReqAsMap.getValue();
        if (ConceptDataType.valueOf(question.getDataType()).equals(ConceptDataType.Coded)) {
            if (value instanceof Collection<?>) {
                ((Collection<String>) value).forEach(vl -> validateAnswer(question, vl));
            } else {
                validateAnswer(question, (String) value);
            }
        }
    }

    private void validateAnswer(Concept question, String uuid) {
        if (question.getConceptAnswers().stream().noneMatch(ans -> ans.getAnswerConcept().getUuid().equals(uuid))) {
            throw new IllegalArgumentException(String.format("Concept answer '%s' not found in Concept '%s'", uuid, question.getUuid()));
        }
    }

    public List<ObservationModelContract> constructObservationModelContracts(ObservationCollection observationCollection) {
        if(observationCollection == null) return Collections.emptyList();
        List<ObservationContract> observationContracts = this.constructObservations(observationCollection);
        List<ObservationModelContract> observationModelContracts = observationContracts.stream()
                .map(this::constructObservation)
                .collect(Collectors.toList());
        return observationModelContracts;
    }

    public ObservationModelContract constructObservation(ObservationContract observationContract) {
        Concept concept = conceptRepository.findByUuid(observationContract.getConcept().getUuid());
        ObservationModelContract observationModelContract = new ObservationModelContract();
        observationModelContract.setValue(observationContract.getValue());
        ConceptModelContract conceptModelContract = ConceptModelContract.fromConcept(concept);
        observationModelContract.setConcept(conceptModelContract);
        return observationModelContract;
    }

    public List<ObservationContract> constructObservations(@NotNull ObservationCollection observationCollection) {
        return observationCollection.entrySet().stream().map(this::getObservationContract).collect(Collectors.toList());
    }

    private ObservationContract getObservationContract(Map.Entry<String, Object> entry) {
        ObservationContract observationContract = new ObservationContract();
        Concept questionConcept = conceptRepository.findByUuid(entry.getKey());
        String conceptDataType = questionConcept.getDataType();
        ConceptContract conceptContract = ConceptContract.create(questionConcept);
        if (conceptDataType.equals(ConceptDataType.Subject.toString())) {
            Object answerValue = entry.getValue();
            List<Individual> subjects = null;
            if (answerValue instanceof Collection) {
                subjects = ((ArrayList<String>) answerValue).stream().map((String uuid) -> individualRepository.findByUuid(uuid)).collect(Collectors.toList());
            } else {
                subjects = Collections.singletonList(individualRepository.findByUuid((String) answerValue));
            }
            observationContract.setSubjects(subjects.stream().map(this::convertIndividualToContract).collect(Collectors.toList()));
        }
        if (conceptDataType.equals(ConceptDataType.Location.toString())) {
            observationContract.setLocation(AddressLevelContractWeb.fromEntity(locationRepository.findByUuid((String) entry.getValue())));
        }
        // Fetch the answer concept in case it is not there in concept_answer table,
        // We have such cases for Bahmni Avni integration
        if (conceptDataType.equals(ConceptDataType.Coded.toString()) && conceptContract.getAnswers().isEmpty()) {
            Object answerValue = entry.getValue();
            List<Concept> conceptAnswers;
            if (answerValue instanceof Collection) {
                conceptAnswers = ((List<String>) answerValue).stream().map(uuid -> conceptRepository.findByUuid(uuid)).collect(Collectors.toList());
            } else {
                conceptAnswers = Collections.singletonList(conceptRepository.findByUuid((String) answerValue));
            }
            conceptContract.setAnswers(conceptAnswers.stream().map(ConceptContract::create).collect(Collectors.toList()));
        }
        observationContract.setConcept(conceptContract);
        if (ConceptDataType.isGroupQuestion(conceptDataType)) {
            if (entry.getValue() instanceof Collection) {
                List<Object> repeatableQuestionGroup = (List<Object>) ((Collection) entry.getValue()).stream().map(value -> {
                    HashMap<String, Object> values = (HashMap<String, Object>) value;
                    return this.constructObservations(new ObservationCollection(values));
                }).collect(Collectors.toList());
                observationContract.setValue(repeatableQuestionGroup);
            } else {
                HashMap<String, Object> values = (HashMap<String, Object>) entry.getValue();
                observationContract.setValue(this.constructObservations(new ObservationCollection(values)));
            }
        } else {
            observationContract.setValue(entry.getValue());
        }
        return observationContract;
    }

    public IndividualContract convertIndividualToContract(Individual individual) {
        IndividualContract individualContract = new IndividualContract();
        individualContract.setId(individual.getId());
        individualContract.setUuid(individual.getUuid());
        individualContract.setFirstName(individual.getFirstName());
        individualContract.setMiddleName(individual.getMiddleName());
        individualContract.setLastName(individual.getLastName());
        if (null != individual.getProfilePicture())
            individualContract.setProfilePicture(individual.getProfilePicture());
        if (null != individual.getDateOfBirth())
            individualContract.setDateOfBirth(individual.getDateOfBirth());
        if (null != individual.getGender()) {
            individualContract.setGender(individual.getGender().getName());
            individualContract.setGenderUUID(individual.getGender().getUuid());
        }
        individualContract.setRegistrationDate(individual.getRegistrationDate());
        AddressLevel addressLevel = individual.getAddressLevel();
        if (addressLevel != null) {
            individualContract.setAddressLevelTypeName(addressLevel.getType().getName());
            individualContract.setAddressLevelTypeId(addressLevel.getType().getId());
            individualContract.setAddressLevel(addressLevel.getTitle());
            individualContract.setAddressLevelUUID(addressLevel.getUuid());
        }
        individualContract.setVoided(individual.isVoided());
        return individualContract;
    }
}
