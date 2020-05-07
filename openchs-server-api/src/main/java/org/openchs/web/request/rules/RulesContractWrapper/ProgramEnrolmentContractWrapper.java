package org.openchs.web.request.rules.RulesContractWrapper;

import org.openchs.web.request.EnrolmentContract;
import org.openchs.web.request.rules.request.RuleRequestEntity;

public class ProgramEnrolmentContractWrapper extends EnrolmentContract {
    private IndividualContractWrapper subject;
    private RuleRequestEntity rule;

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
}
