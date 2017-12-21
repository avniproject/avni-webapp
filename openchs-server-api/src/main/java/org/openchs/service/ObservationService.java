package org.openchs.service;

import org.openchs.dao.ConceptRepository;
import org.openchs.domain.*;
import org.openchs.web.request.ObservationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ObservationService {
    private ConceptRepository conceptRepository;

    @Autowired
    public ObservationService(ConceptRepository conceptRepository) {
        this.conceptRepository = conceptRepository;
    }

    public ObservationCollection createObservations(List<ObservationRequest> observationRequests) {
        List<ObservationRequest> completedObservationRequests = observationRequests
                .stream()
                .map(observationRequest -> {
                    if (observationRequest.getConceptUUID() == null && observationRequest.getConceptName() != null) {
                        Concept concept = conceptRepository.findByName(observationRequest.getConceptName());
                        if (concept == null) {
                            throw new NullPointerException(String.format("Concept with name=%s not found", observationRequest.getConceptName()));
                        }
                        String conceptUUID = concept.getUuid();
                        observationRequest.setConceptUUID(conceptUUID);
                    }
                    return observationRequest;
                }).collect(Collectors.toList());
        return new ObservationCollection(completedObservationRequests
                .stream()
                .collect(Collectors.toConcurrentMap(ObservationRequest::getConceptUUID, ObservationRequest::getValue)));
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
            Arrays.stream(array).map(s -> {
                Concept answerConcept = conceptRepository.findByUuid(s);
                return answerConcept.getName();
            });
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
}