package org.openchs.web.request.rules.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.openchs.web.request.ObservationContract;
import org.openchs.web.request.rules.RulesContractWrapper.VisitSchedule;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class RuleResponseEntity {
    private String status;
    private DecisionResponseEntity decisions;
    private List<VisitSchedule> visitSchedules;
    private List<ObservationContract> observation;
    private RuleError error;

    public RuleError getError() {
        return error;
    }

    public void setError(RuleError error) {
        this.error = error;
    }

    public List<VisitSchedule> getVisitSchedules() {
        return visitSchedules;
    }

    public void setVisitSchedules(List<VisitSchedule> visitSchedules) {
        this.visitSchedules = visitSchedules;
    }

    public List<ObservationContract> getObservation() {
        return observation;
    }

    public void setObservation(List<ObservationContract> observation) {
        this.observation = observation;
    }

    public String getStatus() {
        return this.status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public DecisionResponseEntity getDecisions() {
        return decisions;
    }

    public void setDecisions(DecisionResponseEntity data) {
        this.decisions = data;
    }
}
