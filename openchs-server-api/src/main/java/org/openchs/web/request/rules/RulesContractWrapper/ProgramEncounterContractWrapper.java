package org.openchs.web.request.rules.RulesContractWrapper;

import org.openchs.web.request.EnrolmentContract;
import org.openchs.web.request.ObservationContract;
import org.openchs.web.request.ProgramEncountersContract;
import org.openchs.web.request.rules.request.RuleRequestEntity;

import java.util.List;

public class ProgramEncounterContractWrapper extends ProgramEncountersContract {
    private List<ObservationContract> observations;
    private RuleRequestEntity rule;
    private EnrolmentContract programEnrolment;

    public EnrolmentContract getProgramEnrolment() {
        return programEnrolment;
    }

    public void setProgramEnrolment(EnrolmentContract programEnrolment) {
        this.programEnrolment = programEnrolment;
    }

    public List<ObservationContract> getObservations() {
        return observations;
    }

    public void setObservations(List<ObservationContract> observations) {
        this.observations = observations;
    }

    public RuleRequestEntity getRule() {
        return rule;
    }

    public void setRule(RuleRequestEntity rule) {
        this.rule = rule;
    }
}
