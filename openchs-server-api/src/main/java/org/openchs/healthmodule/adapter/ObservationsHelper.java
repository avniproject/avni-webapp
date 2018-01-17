package org.openchs.healthmodule.adapter;

import org.openchs.dao.ConceptRepository;
import org.openchs.domain.Concept;
import org.openchs.domain.ConceptDataType;
import org.openchs.domain.ObservationCollection;
import org.openchs.util.O;
import org.openchs.web.request.ObservationRequest;

import java.util.List;
import java.util.Map;

public class ObservationsHelper {
    public static Object getObservation(String conceptName, List<ObservationRequest> observationRequestList, ConceptRepository conceptRepository) {
        ObservationRequest observationRequest = observationRequestList.stream().filter(x -> x.getConceptName().equals(conceptName)).findFirst().orElse(null);
        if (observationRequest == null) return null;
        if (conceptRepository.findByName(conceptName).getDataType().equals(ConceptDataType.Date.toString()))
            return O.getDateFromDbFormat((String) observationRequest.getValue());
        return observationRequest;
    }

    public static Object getObservationValue(String conceptName, List<ObservationRequest> observationRequestList, ConceptRepository conceptRepository) {
        return ((ObservationRequest) ObservationsHelper.getObservationValue(conceptName, observationRequestList, conceptRepository))
                .getValue();
    }


    public static Object getObservationValue(String conceptName, ObservationCollection observationCollection, ConceptRepository conceptRepository) {
        Concept concept = conceptRepository.findByName(conceptName);
        Map.Entry<String, Object> matchingObservation = observationCollection.entrySet().stream().filter(x -> {
            return x.getKey().equals(concept.getUuid());
        }).findFirst().orElse(null);

        if (matchingObservation == null) return null;
        if (concept.getDataType().equals(ConceptDataType.Date.toString()))
            return O.getDateFromDbFormat((String) matchingObservation.getValue());
        return matchingObservation.getValue();
    }
}