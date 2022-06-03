package org.avni.web.response;

import org.avni.dao.ConceptRepository;
import org.avni.domain.AbstractEncounter;
import org.avni.domain.Encounter;
import org.avni.domain.ProgramEncounter;
import org.avni.service.ConceptService;

import java.util.LinkedHashMap;

import static org.avni.web.api.CommonFieldNames.*;

public class EncounterResponse extends LinkedHashMap<String, Object> {
    public static EncounterResponse fromProgramEncounter(ProgramEncounter encounter, ConceptRepository conceptRepository, ConceptService conceptService) {
        EncounterResponse encounterResponse = new EncounterResponse();
        encounterResponse.put(ID, encounter.getUuid());
        encounterResponse.put("Subject ID", encounter.getProgramEnrolment().getIndividual().getUuid());
        encounterResponse.put("Subject type", encounter.getProgramEnrolment().getIndividual().getSubjectType().getName());
        encounterResponse.put("Enrolment ID", encounter.getProgramEnrolment().getUuid());
        encounterResponse.put("Subject external Id", encounter.getProgramEnrolment().getIndividual().getLegacyId());
        encounterResponse.put("Enrolment external Id", encounter.getProgramEnrolment().getLegacyId());
        encounterResponse.put("Program", encounter.getProgramEnrolment().getProgram().getName());
        return fromBaseEncounter(encounterResponse, encounter, conceptRepository, conceptService);
    }

    private static EncounterResponse fromBaseEncounter(EncounterResponse encounterResponse, AbstractEncounter encounter, ConceptRepository conceptRepository, ConceptService conceptService) {
        encounterResponse.put(VOIDED, encounter.isVoided());
        encounterResponse.put("External Id", encounter.getLegacyId());
        encounterResponse.put("Encounter type", encounter.getEncounterType().getName());
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

    public static EncounterResponse fromEncounter(Encounter encounter, ConceptRepository conceptRepository, ConceptService conceptService) {
        EncounterResponse encounterResponse = new EncounterResponse();
        encounterResponse.put(ID, encounter.getUuid());
        encounterResponse.put("Subject ID", encounter.getIndividual().getUuid());
        encounterResponse.put("Subject external Id", encounter.getIndividual().getLegacyId());
        encounterResponse.put("Subject type", encounter.getIndividual().getSubjectType().getName());
        return fromBaseEncounter(encounterResponse, encounter, conceptRepository, conceptService);
    }
}
