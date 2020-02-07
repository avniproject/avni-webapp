package org.openchs.web.response;

import org.openchs.dao.ConceptRepository;
import org.openchs.domain.ProgramEncounter;
import org.openchs.service.ConceptService;

import java.util.LinkedHashMap;

public class ProgramEncounterResponse extends LinkedHashMap<String, Object> {
    public static ProgramEncounterResponse fromProgramEncounter(ProgramEncounter programEncounter, ConceptRepository conceptRepository, ConceptService conceptService) {
        ProgramEncounterResponse programEncounterResponse = new ProgramEncounterResponse();
        programEncounterResponse.put("ID", programEncounter.getUuid());
        programEncounterResponse.put("Program", programEncounter.getProgramEnrolment().getProgram().getName());
        programEncounterResponse.put("Encounter type", programEncounter.getEncounterType().getName());
        Response.putIfPresent(programEncounterResponse, "Encounter location", programEncounter.getEncounterLocation());
        programEncounterResponse.put("Encounter date time", programEncounter.getEncounterDateTime());
        programEncounterResponse.put("Earliest scheduled date", programEncounter.getEarliestVisitDateTime());
        programEncounterResponse.put("Max scheduled date", programEncounter.getMaxVisitDateTime());
        Response.putObservations(conceptRepository, conceptService, programEncounterResponse, new LinkedHashMap<>(), programEncounter.getObservations());
        Response.putIfPresent(programEncounterResponse, "Cancel location", programEncounter.getCancelLocation());
        programEncounterResponse.put("Cancel date time", programEncounter.getCancelDateTime());
        Response.putObservations(conceptRepository, conceptService, programEncounterResponse, new LinkedHashMap<>(), programEncounter.getCancelObservations(), "cancelObservations");
        Response.putAudit(programEncounter, programEncounterResponse);
        return programEncounterResponse;
    }
}