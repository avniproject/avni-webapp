package org.openchs.web.request;

import org.openchs.dao.ConceptRepository;
import org.openchs.domain.Concept;
import org.openchs.domain.Observation;
import org.openchs.domain.ObservationCollection;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ObservationService {
    private ConceptRepository conceptRepository;

    @Autowired
    public ObservationService(ConceptRepository conceptRepository) {
        this.conceptRepository = conceptRepository;
    }

    public ObservationCollection createObservations(List<ObservationRequest> observationRequests) {
        ObservationCollection observations = new ObservationCollection();
        for (ObservationRequest observationRequest : observationRequests) {
            Observation observation = new Observation();

            String conceptUUID;
            if (observationRequest.getConceptName() != null) {
                Concept concept = conceptRepository.findByName(observationRequest.getConceptName());
                if (concept == null) throw new RuntimeException(String.format("Concept with name: %s not found", observationRequest.getConceptName()));
                conceptUUID = concept.getUuid();
            } else if (conceptRepository.findByUuid(observationRequest.getConceptUUID()) == null) {
                throw new RuntimeException(String.format("Concept with uuid: %s not found", observationRequest.getConceptUUID()));
            } else {
                conceptUUID = observationRequest.getConceptUUID();
            }

            observation.setConceptUUID(conceptUUID);
            observation.setValue(observationRequest.getValue());
            observations.add(observation);
        }
        return observations;
    }
}