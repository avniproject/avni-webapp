package org.avni.server.web.request.rules.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.avni.server.web.request.rules.RulesContractWrapper.ChecklistContract;
import org.avni.server.web.request.rules.RulesContractWrapper.VisitSchedule;
import org.avni.server.web.request.ObservationContract;

import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class RuleResponseEntity extends BaseRuleResponseEntity {
    private DecisionResponseEntity decisions = new DecisionResponseEntity();
    private List<VisitSchedule> visitSchedules = new ArrayList<>();
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

    public List<VisitSchedule> getVisitSchedules() {
        return visitSchedules;
    }

    public void setVisitSchedules(List<VisitSchedule> visitSchedules) {
        this.visitSchedules = visitSchedules;
    }

    public DecisionResponseEntity getDecisions() {
        return decisions;
    }

    public void setDecisions(DecisionResponseEntity data) {
        this.decisions = data;
    }
}
