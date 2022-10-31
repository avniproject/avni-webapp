package org.avni.server.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.avni.server.web.request.common.CommonProgramEnrolmentRequest;
import org.avni.server.web.request.rules.RulesContractWrapper.ChecklistContract;
import org.avni.server.web.request.rules.RulesContractWrapper.Decisions;
import org.avni.server.web.request.rules.RulesContractWrapper.VisitSchedule;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProgramEnrolmentRequest extends CommonProgramEnrolmentRequest {
    private List<ObservationRequest> observations;
    private List<ObservationRequest> programExitObservations;
    private List<VisitSchedule> visitSchedules;
    private Decisions decisions;
    private List<ChecklistContract> checklists;
    private List<String> identifierAssignmentUuids;

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

    public List<ObservationRequest> getProgramExitObservations() {
        return programExitObservations;
    }

    public void setProgramExitObservations(List<ObservationRequest> programExitObservations) {
        this.programExitObservations = programExitObservations;
    }

    public void addObservation(ObservationRequest observationRequest) {
        if (observationRequest != null)
            this.observations.add(observationRequest);
    }

    public void addExitObservation(ObservationRequest observationRequest) {
        if (observationRequest != null)
            this.programExitObservations.add(observationRequest);
    }

    public ObservationRequest findObservation(String conceptName) {
        return observations.stream().filter(observationRequest -> observationRequest.getConceptName().equals(conceptName)).findAny().orElse(null);
    }

    public Object getObservationValue(String conceptName) {
        ObservationRequest observation = findObservation(conceptName);
        if (observation == null) return null;
        return observation.getValue();
    }

    public Decisions getDecisions() {
        return decisions;
    }

    public void setDecisions(Decisions decisions) {
        this.decisions = decisions;
    }

    public List<ChecklistContract> getChecklists() {
        return checklists;
    }

    public void setChecklists(List<ChecklistContract> checklists) {
        this.checklists = checklists;
    }

    public List<String> getIdentifierAssignmentUuids() {
        return identifierAssignmentUuids;
    }

    public void setIdentifierAssignmentUuids(List<String> identifierAssignmentUuids) {
        this.identifierAssignmentUuids = identifierAssignmentUuids;
    }
}
