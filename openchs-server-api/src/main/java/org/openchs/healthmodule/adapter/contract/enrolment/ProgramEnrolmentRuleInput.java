package org.openchs.healthmodule.adapter.contract.enrolment;

import jdk.nashorn.internal.objects.NativeArray;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.dao.ProgramEncounterRepository;
import org.openchs.domain.ConceptDataType;
import org.openchs.domain.Individual;
import org.openchs.domain.ProgramEncounter;
import org.openchs.healthmodule.adapter.contract.IndividualRuleInput;
import org.openchs.healthmodule.adapter.contract.ProgramRuleInput;
import org.openchs.healthmodule.adapter.contract.encounter.ProgramEncounterRuleInput;
import org.openchs.util.O;
import org.openchs.web.request.ObservationRequest;
import org.openchs.service.ObservationService;
import org.openchs.web.request.ProgramEnrolmentRequest;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class ProgramEnrolmentRuleInput {
    private ProgramEnrolmentRequest programEnrolmentRequest;
    private final IndividualRepository individualRepository;
    private ConceptRepository conceptRepository;
    private final ProgramEncounterRepository programEncounterRepository;
    private ObservationService observationService;
    private IndividualRuleInput individual;
    private ProgramRuleInput program;

    public ProgramEnrolmentRuleInput(ProgramEnrolmentRequest programEnrolmentRequest, IndividualRepository individualRepository, ConceptRepository conceptRepository, ProgramEncounterRepository programEncounterRepository, ObservationService observationService) {
        this.programEnrolmentRequest = programEnrolmentRequest;
        this.individualRepository = individualRepository;
        this.conceptRepository = conceptRepository;
        this.programEncounterRepository = programEncounterRepository;
        this.observationService = observationService;
        Individual individual = individualRepository.findByUuid(programEnrolmentRequest.getIndividualUUID());
        this.individual = new IndividualRuleInput(individual, programEnrolmentRequest.getEnrolmentDateTime().toLocalDate());
        this.program = new ProgramRuleInput(programEnrolmentRequest.getProgram());
    }

    public IndividualRuleInput getIndividual() {
        return individual;
    }

    public void setIndividual(IndividualRuleInput individual) {
        this.individual = individual;
    }

    public ProgramRuleInput getProgram() {
        return program;
    }

    public void setProgram(ProgramRuleInput program) {
        this.program = program;
    }

    // In data migration this will never be called in edit mode, so it can assume that there are no encounters
    public Object getObservationReadableValueInEntireEnrolment(String conceptName, Object programEncounter) {
        return this.getObservationValue(conceptName);
    }

    public Object findEncounter(String encounterTypeName, String encounterName) {
        return null;
    }

    public boolean hasEncounter(String encounterTypeName, String encounterName) {
        return false;
    }

    public Object[] getEncounters() {
        return new Object[]{};
    }
    // end

    public Object getObservationValue(String conceptName) {
        ObservationRequest observationRequest = programEnrolmentRequest.getObservations().stream().filter(x -> x.getConceptName().equals(conceptName)).findFirst().orElse(null);
        if (observationRequest == null) return null;
        if (conceptRepository.findByName(conceptName).getDataType().equals(ConceptDataType.Date.toString()))
            return O.getDateFromDbFormat((String) observationRequest.getValue());
        return observationRequest.getValue();
    }

    public ProgramEnrolmentRequest getProgramEnrolmentRequest() {
        return programEnrolmentRequest;
    }
}