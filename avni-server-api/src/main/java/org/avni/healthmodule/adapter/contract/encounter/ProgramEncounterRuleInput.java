package org.avni.healthmodule.adapter.contract.encounter;

import org.avni.dao.ConceptRepository;
import org.avni.domain.*;
import org.avni.healthmodule.adapter.ObservationsHelper;
import org.avni.service.ObservationService;
import org.avni.web.request.ProgramEncounterRequest;

import java.util.Date;

public class ProgramEncounterRuleInput {
    private final ProgramEnrolmentForProgramEncounterRuleInput programEnrolment;
    private final ConceptRepository conceptRepository;
    private final ProgramEncounterRequest programEncounterRequest;

    public ProgramEncounterRuleInput(ProgramEnrolment programEnrolment, ConceptRepository conceptRepository, ProgramEncounterRequest programEncounterRequest, ObservationService observationService) {
        this.programEnrolment = new ProgramEnrolmentForProgramEncounterRuleInput(programEnrolment, conceptRepository, observationService);
        this.conceptRepository = conceptRepository;
        this.programEncounterRequest = programEncounterRequest;
    }

    public EncounterType getEncounterType() {
        return EncounterType.create(programEncounterRequest.getEncounterType());
    }

    public String getName() {
        return programEncounterRequest.getName();
    }

    public Date getEncounterDateTime() {
        return programEncounterRequest.getEncounterDateTime().toDate();
    }

    public ProgramEnrolmentForProgramEncounterRuleInput getProgramEnrolment() {
        return programEnrolment;
    }

    public Object getObservationValue(String conceptName) {
        return ObservationsHelper.getObservationValue(conceptName, programEncounterRequest.getObservations(), conceptRepository);
    }
}
