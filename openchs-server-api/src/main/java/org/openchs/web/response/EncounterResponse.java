package org.openchs.web.response;

import org.openchs.dao.ConceptRepository;
import org.openchs.domain.Encounter;
import org.openchs.domain.ProgramEncounter;
import org.openchs.service.ConceptService;

import java.util.LinkedHashMap;

public class EncounterResponse extends LinkedHashMap<String, Object> {
    public static EncounterResponse fromEncounter(Encounter encounter, ConceptRepository conceptRepository, ConceptService conceptService) {
        EncounterResponse encounterResponse = new EncounterResponse();
        encounterResponse.put("ID", encounter.getUuid());
        encounterResponse.put("Encounter type", encounter.getEncounterType().getName());

        encounterResponse.put("Subject ID", encounter.getIndividual().getUuid());
        encounterResponse.put("Subject type", encounter.getIndividual().getSubjectType().getName());

        Response.putIfPresent(encounterResponse, "Encounter location", encounter.getEncounterLocation());
        encounterResponse.put("Encounter date time", encounter.getEncounterDateTime());
        encounterResponse.put("Earliest scheduled date", encounter.getEarliestVisitDateTime());
        encounterResponse.put("Max scheduled date", encounter.getMaxVisitDateTime());
        Response.putObservations(conceptRepository, conceptService, encounterResponse, new LinkedHashMap<>(), encounter.getObservations());
        Response.putIfPresent(encounterResponse, "Cancel location", encounter.getCancelLocation());
        encounterResponse.put("Cancel date time", encounter.getCancelDateTime());
        Response.putObservations(conceptRepository, conceptService, encounterResponse, new LinkedHashMap<>(), encounter.getCancelObservations(), "cancelObservations");
        Response.putAudit(encounter, encounterResponse);
        return encounterResponse;
    }
}
