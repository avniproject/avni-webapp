package org.openchs.web.request.rules.RulesContractWrapper;

import org.openchs.web.request.EnrolmentContract;
import org.openchs.web.request.ObservationContract;
import org.openchs.web.request.ProgramEncountersContract;
import org.openchs.web.request.rules.request.RuleRequestEntity;

import java.util.List;

public class ProgramEncounterContractWrapper extends ProgramEncountersContract {
    private List<ObservationContract> observations;
    private RuleRequestEntity rule;
    private ProgramEnrolmentContractWrapper programEnrolment;
    private List<VisitSchedule> visitSchedules;

    public List<VisitSchedule> getVisitSchedules() {
        return visitSchedules;
    }

    public void setVisitSchedules(List<VisitSchedule> visitSchedules) {
        this.visitSchedules = visitSchedules;
    }

    public ProgramEnrolmentContractWrapper getProgramEnrolment() {
        return programEnrolment;
    }

    public void setProgramEnrolment(ProgramEnrolmentContractWrapper programEnrolment) {
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
