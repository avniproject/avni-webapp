package org.openchs.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.openchs.web.request.rules.RulesContractWrapper.VisitSchedule;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class EncounterRequest extends AbstractEncounterRequest {
    private String individualUUID;
    private List<VisitSchedule> visitSchedules;

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
}