package org.openchs.web.request.rules.RulesContractWrapper;

import org.openchs.web.request.EncounterContract;
import org.openchs.web.request.ObservationContract;
import org.openchs.web.request.rules.request.RuleRequestEntity;

import java.util.List;

public class EncounterContractWrapper extends EncounterContract {
    private List<ObservationContract> observations;
    private RuleRequestEntity rule;
    private IndividualContractWrapper subject;

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

    public IndividualContractWrapper getSubject() {
        return subject;
    }

    public void setSubject(IndividualContractWrapper subject) {
        this.subject = subject;
    }
}
