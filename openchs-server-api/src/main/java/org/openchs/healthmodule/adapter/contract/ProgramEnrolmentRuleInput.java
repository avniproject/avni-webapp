package org.openchs.healthmodule.adapter.contract;

import org.openchs.dao.ConceptRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.domain.ConceptDataType;
import org.openchs.domain.Individual;
import org.openchs.util.O;
import org.openchs.web.request.ObservationRequest;
import org.openchs.web.request.ProgramEnrolmentRequest;

public class ProgramEnrolmentRuleInput {
    private ProgramEnrolmentRequest programEnrolmentRequest;
    private ConceptRepository conceptRepository;
    private IndividualRuleInput individual;
    private ProgramRuleInput program;

    public ProgramEnrolmentRuleInput() {
    }

    public ProgramEnrolmentRuleInput(ProgramEnrolmentRequest programEnrolmentRequest, IndividualRepository individualRepository, ConceptRepository conceptRepository) {
        this.programEnrolmentRequest = programEnrolmentRequest;
        this.conceptRepository = conceptRepository;
        Individual individual = individualRepository.findByUuid(programEnrolmentRequest.getIndividualUUID());
        this.individual = new IndividualRuleInput(individual, programEnrolmentRequest.getEnrolmentDateTime().toLocalDate());
        this.program = new ProgramRuleInput(programEnrolmentRequest.getProgram());
    }

    public ProgramEnrolmentRuleInput(IndividualRuleInput individual, ProgramRuleInput program) {
        this.individual = individual;
        this.program = program;
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

    public Object getObservationValueFromEntireEnrolment(String conceptName, Object programEncounter) {
        ObservationRequest observationRequest = programEnrolmentRequest.getObservations().stream().filter(x -> x.getConceptName().equals(conceptName)).findFirst().orElse(null);
        if (observationRequest == null) return null;
        if (conceptRepository.findByName(conceptName).getDataType().equals(ConceptDataType.Date.toString()))
            return O.getDateFromDbFormat((String) observationRequest.getValue());
        return observationRequest.getValue();
    }

    public Object getObservationValue(String conceptName) {
        return this.getObservationValueFromEntireEnrolment(conceptName, null);
    }
}