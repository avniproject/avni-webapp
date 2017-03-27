package org.openchs.web;

import org.openchs.dao.ConceptRepository;
import org.openchs.domain.Observation;
import org.openchs.domain.ObservationCollection;
import org.openchs.web.request.AbstractEncounterRequest;
import org.openchs.web.request.ObservationRequest;

public class EncounterControllerUtil {
    static ObservationCollection createObservationCollection(ConceptRepository conceptRepository, AbstractEncounterRequest request) {
        ObservationCollection observations = new ObservationCollection();
        for (ObservationRequest observationRequest : request.getObservations()) {
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