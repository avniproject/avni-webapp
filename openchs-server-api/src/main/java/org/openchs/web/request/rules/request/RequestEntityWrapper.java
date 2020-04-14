package org.openchs.web.request.rules.request;

public class RequestEntityWrapper {
    private IndividualRequestEntity individualRequestEntity;
    private ProgramEncounterRequestEntity programEncounterRequestEntity;
    private ProgramEnrolmentRequestEntity programEnrolmentRequestEntity;
    private RuleRequestEntity rule;

    public ProgramEnrolmentRequestEntity getProgramEnrolmentRequestEntity() {
        return programEnrolmentRequestEntity;
    }

    public void setProgramEnrolmentRequestEntity(ProgramEnrolmentRequestEntity programEnrolmentRequestEntity) {
        this.programEnrolmentRequestEntity = programEnrolmentRequestEntity;
    }

    public IndividualRequestEntity getIndividualRequestEntity() {
        return individualRequestEntity;
    }

    public void setIndividualRequestEntity(IndividualRequestEntity individualRequestEntity) {
        this.individualRequestEntity = individualRequestEntity;
    }

    public ProgramEncounterRequestEntity getProgramEncounterRequestEntity() {
        return programEncounterRequestEntity;
    }

    public void setProgramEncounterRequestEntity(ProgramEncounterRequestEntity programEncounterRequestEntity) {
        this.programEncounterRequestEntity = programEncounterRequestEntity;
    }

    public RuleRequestEntity getRule() {
        return rule;
    }

    public void setRule(RuleRequestEntity rule) {
        this.rule = rule;
    }
}
