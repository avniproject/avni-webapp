package org.openchs.service;

import org.openchs.dao.ConceptRepository;
import org.openchs.domain.Concept;
import org.openchs.domain.ConceptDataType;
import org.openchs.domain.ObservationCollection;
import org.openchs.domain.ProgramEncounter;
import org.openchs.web.request.ObservationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
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

        ObservationCollection observations = programEncounter.getObservations();
        Object storedValue = observations.get(concept.getUuid());
        if (concept.getDataType().equals(ConceptDataType.Coded.toString())) {
            String[] array = (String[]) storedValue;
            Arrays.stream(array).map(s -> {
                Concept answerConcept = conceptRepository.findByUuid(s);
                return answerConcept.getName();
            });
        }
        return storedValue;
    }
}