package org.openchs.healthmodule.adapter.contract;

public class ProgramEnrolmentRuleInput {
    private IndividualRuleInput individual;
    private ProgramRuleInput program;

    public ProgramEnrolmentRuleInput() {
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