package org.avni.importer.batch.csv.contract;

import org.avni.web.request.ObservationRequest;
import org.avni.web.request.rules.RulesContractWrapper.Decisions;
import org.avni.web.request.rules.RulesContractWrapper.VisitSchedule;
import org.avni.web.request.rules.response.DecisionResponseEntity;

import java.util.List;

public class UploadRuleServerResponseContract {
    private List<ObservationRequest> observations;
    private List<String> errors;
    private Decisions decisions;
    private List<VisitSchedule> visitSchedules;

    public List<String> getErrors() {
        return errors;
    }

    public void setErrors(List<String> errors) {
        this.errors = errors;
    }

    public Decisions getDecisions() {
        return decisions;
    }

    public void setDecisions(Decisions decisions) {
        this.decisions = decisions;
    }

    public List<VisitSchedule> getVisitSchedules() {
        return visitSchedules;
    }

    public void setVisitSchedules(List<VisitSchedule> visitSchedules) {
        this.visitSchedules = visitSchedules;
    }

    public List<ObservationRequest> getObservations() {
        return observations;
    }

    public void setObservations(List<ObservationRequest> observations) {
        this.observations = observations;
    }
}
