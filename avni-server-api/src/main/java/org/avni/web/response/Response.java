package org.avni.web.response;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.avni.dao.ConceptRepository;
import org.avni.domain.CHSBaseEntity;
import org.avni.domain.CHSEntity;
import org.avni.domain.ObservationCollection;
import org.avni.service.ConceptService;
import org.avni.util.ObjectMapperSingleton;

import java.util.*;
import java.util.stream.Collectors;

public class Response {
    static void putIfPresent(Map<String, Object> map, String name, Object value) {
        if (value != null) map.put(name, value);
    }

    static void putObservations(ConceptRepository conceptRepository, ConceptService conceptService, Map<String, Object> parentMap,
                                LinkedHashMap<String, Object> observationsResponse, ObservationCollection observations, String observationsResponseKeyName) {
        mapObservations(conceptRepository, conceptService, observationsResponse, observations);
        parentMap.put(observationsResponseKeyName, observationsResponse);
    }

    public static void mapObservations(ConceptRepository conceptRepository, ConceptService conceptService, LinkedHashMap<String, Object> observationsResponse, ObservationCollection observations) {
        ObservationCollection obs = Optional.ofNullable(observations).orElse(new ObservationCollection());
        String stringObservations;
        try {
            stringObservations = ObjectMapperSingleton.getObjectMapper().writeValueAsString(obs);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(String.format("Error while processing observation %s", obs.toString()));
        }
        List<Map<String, String>> conceptMaps = conceptRepository.getConceptUuidToNameMapList(stringObservations);
        Map<String, String> conceptMap = conceptMaps.stream().collect(Collectors.toMap(s -> s.get("uuid"), s -> s.get("name")));
        obs.forEach((key, value) -> observationsResponse.put(conceptMap.get(key), conceptService.getObservationValue(conceptMap, value)));
    }

    static void putObservations(ConceptRepository conceptRepository, ConceptService conceptService, Map<String, Object> parentMap, LinkedHashMap<String, Object> observationsResponse, ObservationCollection observations) {
        Response.putObservations(conceptRepository, conceptService, parentMap, observationsResponse, observations, "observations");
    }

    static void putAudit(CHSEntity avniEntity, Map<String, Object> objectMap) {
        LinkedHashMap<String, Object> audit = new LinkedHashMap<>();
        audit.put("Created at", avniEntity.getCreatedDateTime());
        audit.put("Last modified at", avniEntity.getLastModifiedDateTime());
        audit.put("Created by", avniEntity.getCreatedByName());
        audit.put("Last modified by", avniEntity.getLastModifiedByName());
        objectMap.put("audit", audit);
    }

    static void putChildren(LinkedHashMap<String, Object> parentMap, String key, Set<CHSBaseEntity> children) {
        parentMap.put(key, new ArrayList<>(children.stream().map(CHSBaseEntity::getUuid).collect(Collectors.toList())));
    }
}
