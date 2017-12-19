package org.openchs.healthmodule.adapter.contract.encounter;

import org.openchs.dao.ConceptRepository;
import org.openchs.domain.Concept;
import org.openchs.domain.ProgramEncounter;
import org.openchs.healthmodule.adapter.contract.enrolment.ProgramEnrolmentRuleInput;
import org.openchs.service.ObservationService;

import java.util.Date;

public class ProgramEncounterRuleInput {
    private ProgramEnrolmentRuleInput programEnrolmentRuleInput;
    private ProgramEncounter programEncounter;
    private ObservationService observationService;

    public ProgramEncounterRuleInput(ProgramEnrolmentRuleInput programEnrolmentRuleInput, ProgramEncounter programEncounter, ObservationService observationService) {
        this.programEnrolmentRuleInput = programEnrolmentRuleInput;
        this.programEncounter = programEncounter;
        this.observationService = observationService;
    }

    public EncounterTypeRuleInput getEncounterType() {
        return new EncounterTypeRuleInput(programEncounter.getEncounterType());
    }

    public String getName() {
        return programEncounter.getName();
    }

    public Date getEncounterDateTime() {
        return programEncounter.getEncounterDateTime().toDate();
    }

    public ProgramEnrolmentRuleInput getProgramEnrolment() {
        return programEnrolmentRuleInput;
    }

    public Object getObservationValue(String conceptName) {
        return observationService.getObservationValue(conceptName, programEncounter);
    }

    public ProgramEncounter getUnderlyingEncounter() {
        return programEncounter;
    }
}