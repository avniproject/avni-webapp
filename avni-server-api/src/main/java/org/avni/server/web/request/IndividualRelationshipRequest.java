package org.avni.server.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.joda.time.DateTime;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class IndividualRelationshipRequest extends CHSRequest {

    private String relationshipTypeUUID;
    private String individualAUUID;
    private String individualBUUID;
    private DateTime enterDateTime;
    private DateTime exitDateTime;
    private List<ObservationRequest> exitObservations;

    public String getRelationshipTypeUUID() {
        return relationshipTypeUUID;
    }

    public void setRelationshipTypeUUID(String relationshipTypeUUID) {
        this.relationshipTypeUUID = relationshipTypeUUID;
    }

    public String getIndividualAUUID() {
        return individualAUUID;
    }

    public void setIndividualAUUID(String individualAUUID) {
        this.individualAUUID = individualAUUID;
    }

    public String getIndividualBUUID() {
        return individualBUUID;
    }

    public void setIndividualBUUID(String individualBUUID) {
        this.individualBUUID = individualBUUID;
    }

    public DateTime getEnterDateTime() {
        return enterDateTime;
    }

    public void setEnterDateTime(DateTime enterDateTime) {
        this.enterDateTime = enterDateTime;
    }

    public DateTime getExitDateTime() {
        return exitDateTime;
    }

    public void setExitDateTime(DateTime exitDateTime) {
        this.exitDateTime = exitDateTime;
    }

    public List<ObservationRequest> getExitObservations() {
        return exitObservations;
    }

    public void setExitObservations(List<ObservationRequest> exitObservations) {
        this.exitObservations = exitObservations;
    }
}
