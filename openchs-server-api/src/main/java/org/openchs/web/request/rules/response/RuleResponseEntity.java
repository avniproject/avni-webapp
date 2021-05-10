package org.openchs.web.request.rules.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.openchs.web.request.ObservationContract;
import org.openchs.web.request.rules.RulesContractWrapper.ChecklistContract;
import org.openchs.web.request.rules.RulesContractWrapper.VisitSchedule;

import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class RuleResponseEntity {
    private String status;
    private DecisionResponseEntity decisions = new DecisionResponseEntity();
    private List<VisitSchedule> visitSchedules = new ArrayList<>();
    private RuleError error;
    private List<ChecklistContract> checklists = new ArrayList<>();
    private List<KeyValueResponse> summaries = new ArrayList<>();
    private List<ObservationContract> summaryObservations = new ArrayList<>();

    public List<ObservationContract> getSummaryObservations() {
        return summaryObservations;
    }

    public void setSummaryObservations(List<ObservationContract> summaryObservations) {
        this.summaryObservations = summaryObservations;
    }

    public List<KeyValueResponse> getSummaries() {
        return summaries;
    }

    public void setSummaries(List<KeyValueResponse> summaries) {
        this.summaries = summaries;
    }


    public List<ChecklistContract> getChecklists() {
        return checklists;
    }

    public void setChecklists(List<ChecklistContract> checklists) {
        this.checklists = checklists;
    }

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
