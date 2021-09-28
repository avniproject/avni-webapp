package org.avni.web.request.api;

import org.avni.dao.ConceptRepository;
import org.avni.domain.Concept;
import org.avni.domain.ConceptDataType;
import org.avni.domain.ObservationCollection;
import org.avni.util.BadRequestError;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class RequestUtils {
    public static ObservationCollection createObservations(Map<String, Object> observationsRequest, ConceptRepository conceptRepository) {
        Map<String, Object> observations = new HashMap<>();
        for (Map.Entry<String, Object> entry : observationsRequest.entrySet()) {
            String conceptName = entry.getKey();
            Concept concept = conceptRepository.findByName(conceptName);
            if (concept == null) {
                throw new NullPointerException(String.format("Concept with name=%s not found", conceptName));
            }
            String conceptUUID = concept.getUuid();
            String conceptDataType = concept.getDataType();
            Object obsValue;
            Object entryValue = entry.getValue();

            if (entryValue == null) continue; //Ignore null values as in Avni there is no difference between null value and non-existence of an observation

            switch (ConceptDataType.valueOf(conceptDataType)) {
                case Coded: {
                    if (entryValue instanceof Collection<?>) {
                        obsValue = ((List<String>) entryValue).stream().map(answerConceptName -> {
                            Concept answerConcept = conceptRepository.findByName(answerConceptName);
                            if (answerConcept == null)
                                throw new BadRequestError(String.format("Answer concept with name=%s not found", answerConceptName));
                            return answerConcept.getUuid();
                        }).collect(Collectors.toList());
                    } else {
                        String answerConceptName = (String) entryValue;
                        Concept answerConcept = conceptRepository.findByName(answerConceptName);
                        if (answerConcept == null)
                            throw new BadRequestError(String.format("Answer concept with name=%s not found", answerConceptName));
                        obsValue = answerConcept.getUuid();
                    }
                    break;
                }
                default: {
                    obsValue = entryValue;
                    break;
                }
            }
            observations.put(conceptUUID, obsValue);
        }
        return new ObservationCollection(observations);
    }
}
