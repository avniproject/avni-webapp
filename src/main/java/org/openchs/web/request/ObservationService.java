package org.openchs.web.request;

import org.openchs.dao.ConceptRepository;
import org.openchs.domain.Observation;
import org.openchs.domain.ObservationCollection;
import org.openchs.web.request.AbstractEncounterRequest;
import org.openchs.web.request.ObservationRequest;
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

            if (conceptRepository.findByUuid(observationRequest.getConceptUUID()) == null) {
                throw new RuntimeException(String.format("Concept with uuid: %s not found", observationRequest.getConceptUUID()));
            }

            observation.setConceptUUID(observationRequest.getConceptUUID());
            observation.setValuePrimitive(observationRequest.getValuePrimitive());
            observation.setValueCoded(observationRequest.getValueCoded());
            observations.add(observation);
        }
        return observations;
    }
}