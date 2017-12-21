package org.openchs.healthmodule.adapter.contract.enrolment;

import org.openchs.dao.ConceptRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.domain.ConceptDataType;
import org.openchs.domain.Individual;
import org.openchs.healthmodule.adapter.ObservationsHelper;
import org.openchs.healthmodule.adapter.contract.IndividualRuleInput;
import org.openchs.healthmodule.adapter.contract.ProgramRuleInput;
import org.openchs.util.O;
import org.openchs.web.request.ObservationRequest;
import org.openchs.web.request.ProgramEnrolmentRequest;

public class ProgramEnrolmentRuleInput {
    private ProgramEnrolmentRequest programEnrolmentRequest;
    private ConceptRepository conceptRepository;
    private IndividualRuleInput individual;
    private ProgramRuleInput program;

    public ProgramEnrolmentRuleInput(ProgramEnrolmentRequest programEnrolmentRequest, IndividualRepository individualRepository, ConceptRepository conceptRepository) {
        this.programEnrolmentRequest = programEnrolmentRequest;
        this.conceptRepository = conceptRepository;
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
        return ObservationsHelper.getObservationValue(conceptName, programEnrolmentRequest.getObservations(), conceptRepository);
    }

    public ProgramEnrolmentRequest getProgramEnrolmentRequest() {
        return programEnrolmentRequest;
    }
}