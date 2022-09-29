package org.avni.server.adapter.contract.encounter;

import org.avni.server.dao.ConceptRepository;
import org.avni.server.domain.*;
import org.joda.time.DateTime;
import org.avni.server.adapter.ObservationsHelper;
import org.avni.server.service.ObservationService;

public class ProgramEnrolmentForProgramEncounterRuleInput {
    private final ProgramEnrolment programEnrolment;
    private final ConceptRepository conceptRepository;
    private ObservationService observationService;

    public ProgramEnrolmentForProgramEncounterRuleInput(ProgramEnrolment programEnrolment, ConceptRepository conceptRepository, ObservationService observationService) {
        this.programEnrolment = programEnrolment;
        this.conceptRepository = conceptRepository;
        this.observationService = observationService;
    }

    public Program getProgram() {
        return programEnrolment.getProgram();
    }

    public DateTime getEnrolmentDateTime() {
        return programEnrolment.getEnrolmentDateTime();
    }

    public ProgramOutcome getProgramOutcome() {
        return programEnrolment.getProgramOutcome();
    }

    public DateTime getProgramExitDateTime() {
        return programEnrolment.getProgramExitDateTime();
    }

    public Object getObservationValue(String conceptName) {
        return ObservationsHelper.getObservationValue(conceptName, this.programEnrolment.getObservations(), conceptRepository);
    }

    public Individual getIndividual() {
        return programEnrolment.getIndividual();
    }

    //Doesn't support edit encounter, hence we can in the entire enrolment loaded from database
    public Object getObservationReadableValueInEntireEnrolment(String conceptName, Object programEncounter) {
        return observationService.getObservationValue(conceptName, this.programEnrolment);
    }

    public ProgramEncounter findEncounter(String encounterTypeName, String encounterName) {
        return this.programEnrolment.findEncounter(encounterTypeName, encounterName);
    }

    public boolean hasEncounter(String encounterTypeName, String encounterName) {
        return this.findEncounter(encounterTypeName, encounterName) != null;
    }
}
