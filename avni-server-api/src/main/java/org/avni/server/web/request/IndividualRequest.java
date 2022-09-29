package org.avni.server.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.avni.server.web.request.common.CommonIndividualRequest;
import org.avni.server.web.request.rules.RulesContractWrapper.Decisions;
import org.avni.server.web.request.rules.RulesContractWrapper.VisitSchedule;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class IndividualRequest extends CommonIndividualRequest {
    private List<ObservationRequest> observations;
    private List<VisitSchedule> visitSchedules;
    private Decisions decisions;
    private List<String> identifierAssignmentUuids;


    public IndividualRequest() {
    }

    public IndividualRequest(List<ObservationRequest> observations) {
        this.observations = observations;
    }

    public List<ObservationRequest> getObservations() {
        return observations;
    }

    public void setObservations(List<ObservationRequest> observations) {
        this.observations = observations;
    }

    public void addObservation(ObservationRequest observationRequest) {
        if (observationRequest != null) {
            ObservationRequest existingObservationRequest = this.observations.stream().filter(obj -> obj.getConceptName().equals(observationRequest.getConceptName())).findFirst().orElse(null);
            if (existingObservationRequest == null) {
                this.observations.add(observationRequest);
            } else {
                existingObservationRequest.update(observationRequest.getValue());
            }
        }
    }

    public ObservationRequest findObservation(String conceptName) {
        return observations.stream().filter(observationRequest -> observationRequest.getConceptName().equals(conceptName)).findAny().orElse(null);
    }

    public Object getObservationValue(String conceptName) {
        return findObservation(conceptName).getValue();
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

    public List<String> getIdentifierAssignmentUuids() {
        return identifierAssignmentUuids;
    }

    public void setIdentifierAssignmentUuids(List<String> identifierAssignmentUuids) {
        this.identifierAssignmentUuids = identifierAssignmentUuids;
    }
}
