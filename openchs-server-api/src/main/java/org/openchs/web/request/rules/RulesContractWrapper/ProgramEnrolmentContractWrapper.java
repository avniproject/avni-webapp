package org.openchs.web.request.rules.RulesContractWrapper;

import org.openchs.web.request.EnrolmentContract;
import org.openchs.web.request.rules.request.RuleRequestEntity;

import java.util.List;

public class ProgramEnrolmentContractWrapper extends EnrolmentContract {
    private IndividualContractWrapper subject;
    private RuleRequestEntity rule;
    private List<VisitSchedule> visitSchedules;

    public RuleRequestEntity getRule() {
        return rule;
    }

    public void setRule(RuleRequestEntity rule) {
        this.rule = rule;
    }

    public IndividualContractWrapper getSubject() {
        return subject;
    }

    public void setSubject(IndividualContractWrapper subject) {
        this.subject = subject;
    }

    public List<VisitSchedule> getVisitSchedules() {
        return visitSchedules;
    }

    public void setVisitSchedules(List<VisitSchedule> visitSchedules) {
        this.visitSchedules = visitSchedules;
    }
}
