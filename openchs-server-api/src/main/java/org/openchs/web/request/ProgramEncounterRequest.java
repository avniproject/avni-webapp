package org.openchs.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.joda.time.DateTime;
import org.openchs.web.request.rules.RulesContractWrapper.VisitSchedule;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProgramEncounterRequest extends AbstractEncounterRequest {
    private String programEnrolmentUUID;
    private List<VisitSchedule> visitSchedules;

    public String getProgramEnrolmentUUID() {
        return programEnrolmentUUID;
    }

    public void setProgramEnrolmentUUID(String programEnrolmentUUID) {
        this.programEnrolmentUUID = programEnrolmentUUID;
    }

    public List<VisitSchedule> getVisitSchedules() {
        return visitSchedules;
    }

    public void setVisitSchedules(List<VisitSchedule> visitSchedules) {
        this.visitSchedules = visitSchedules;
    }

    public static ProgramEncounterRequest createSafeInstance() {
        ProgramEncounterRequest programEncounterRequest = new ProgramEncounterRequest();
        programEncounterRequest.setUuid(UUID.randomUUID().toString());
        programEncounterRequest.setObservations(new ArrayList<>());
        programEncounterRequest.setCancelObservations(new ArrayList<>());
        return programEncounterRequest;
    }

}