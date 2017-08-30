package org.openchs.healthmodule.adapter.contract;

import org.openchs.dao.IndividualRepository;
import org.openchs.domain.Individual;
import org.openchs.web.request.ProgramEnrolmentRequest;

public class ProgramEnrolmentRuleInput {
    private IndividualRuleInput individual;
    private ProgramRuleInput program;

    public ProgramEnrolmentRuleInput() {
    }

    public ProgramEnrolmentRuleInput(ProgramEnrolmentRequest programEnrolmentRequest, IndividualRepository individualRepository) {
        Individual individual = individualRepository.findByUuid(programEnrolmentRequest.getIndividualUUID());
        this.individual = new IndividualRuleInput(individual.getDateOfBirth().toDate());
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
}