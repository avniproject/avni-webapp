package org.openchs.web.response;

import org.openchs.dao.ConceptRepository;
import org.openchs.domain.CHSEntity;
import org.openchs.domain.Concept;
import org.openchs.domain.ObservationCollection;
import org.openchs.service.ConceptService;

import java.util.LinkedHashMap;
import java.util.Map;

public class Response {
    static void putIfPresent(Map<String, Object> map, String name, Object value) {
        if (value != null) map.put(name, value);
    }

    static void putObservations(ConceptRepository conceptRepository, ConceptService conceptService, Map<String, Object> parentMap, LinkedHashMap<String, Object> observationsResponse, ObservationCollection observations, String observationsResponseKeyName) {
        observations.forEach((key, value) -> {
            Concept concept = conceptRepository.findByUuid(key);
            observationsResponse.put(concept.getName(), conceptService.getObservationValue(concept, value));
        });
        parentMap.put(observationsResponseKeyName, observationsResponse);
    }

    static void putObservations(ConceptRepository conceptRepository, ConceptService conceptService, Map<String, Object> parentMap, LinkedHashMap<String, Object> observationsResponse, ObservationCollection observations) {
        Response.putObservations(conceptRepository, conceptService, parentMap, observationsResponse, observations, "observations");
    }

    static void putAudit(CHSEntity avniEntity, Map<String, Object> objectMap) {
        LinkedHashMap<String, Object> audit = new LinkedHashMap<>();
        audit.put("Created at", avniEntity.getCreatedDateTime());
        audit.put("Last modified at", avniEntity.getLastModifiedDateTime());
        audit.put("Created by", avniEntity.getCreatedBy());
        audit.put("Last modified by", avniEntity.getLastModifiedBy());
        objectMap.put("audit", audit);
    }
}