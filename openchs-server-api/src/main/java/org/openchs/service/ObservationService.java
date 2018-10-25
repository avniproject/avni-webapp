package org.openchs.service;

import org.openchs.dao.ConceptRepository;
import org.openchs.domain.*;
import org.openchs.web.request.ObservationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ObservationService {
    private ConceptRepository conceptRepository;

    @Autowired
    public ObservationService(ConceptRepository conceptRepository) {
        this.conceptRepository = conceptRepository;
    }

    public ObservationCollection createObservations(List<ObservationRequest> observationRequests) {
        Map<String, Object> completedObservationRequests = observationRequests
                .stream()
                .peek(observationRequest -> {
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
                    if (ConceptDataType.valueOf(concept.getDataType()).equals(ConceptDataType.Coded)) {
                        validate(concept, observationRequest.getValue());
                    }
                })
                .collect(Collectors
                        .toConcurrentMap(ObservationRequest::getConceptUUID, ObservationRequest::getValue, (oldVal, newVal) -> newVal));
        return new ObservationCollection(completedObservationRequests);
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

    private void validate(Concept question, Object value) {
        if (value instanceof Collection<?>) {
            ((Collection<String>) value).forEach(vl-> validateAnswer(question, vl));
        } else {
            validateAnswer(question, (String) value);
        }
    }

    private void validateAnswer(Concept question, String uuid) {
        if(question.getConceptAnswers().stream().noneMatch(ans -> ans.getAnswerConcept().getUuid().equals(uuid))) {
            throw new IllegalArgumentException(String.format("Concept answer '%s' not found in Concept '%s'", uuid, question.getUuid()));
        }
    }
}