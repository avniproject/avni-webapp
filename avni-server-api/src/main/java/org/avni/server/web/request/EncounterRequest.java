package org.avni.server.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.avni.server.web.request.rules.RulesContractWrapper.Decisions;
import org.avni.server.web.request.rules.RulesContractWrapper.VisitSchedule;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class EncounterRequest extends AbstractEncounterRequest {
    private String individualUUID;
    private List<VisitSchedule> visitSchedules;
    private Decisions decisions;

    public String getIndividualUUID() {
        return individualUUID;
    }

    public void setIndividualUUID(String individualUUID) {
        this.individualUUID = individualUUID;
    }

    public List<VisitSchedule> getVisitSchedules() {
        return visitSchedules;
    }

    public void setVisitSchedules(List<VisitSchedule> visitSchedules) {
        this.visitSchedules = visitSchedules;
    }

    public Decisions getDecisions() {
        return decisions;
    }

    public void setDecisions(Decisions decisions) {
        this.decisions = decisions;
    }
}
