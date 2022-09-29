package org.avni.server.web.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.joda.time.DateTime;

import java.util.ArrayList;
import java.util.List;

public class RelationshipContract extends ReferenceDataContract{
    private IndividualRelationshipTypeContract relationshipType = new IndividualRelationshipTypeContract();

    private IndividualContract individualB = new IndividualContract();

    private DateTime enterDateTime;

    private DateTime exitDateTime;

    @JsonInclude
    private List<ObservationContract> exitObservations = new ArrayList<>();

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

    public List<ObservationContract> getExitObservations() {
        return exitObservations;
    }

    public void setExitObservations(List<ObservationContract> exitObservations) {
        this.exitObservations = exitObservations;
    }

    public IndividualRelationshipTypeContract getRelationshipType() {
        return relationshipType;
    }

    public void setRelationshipType(IndividualRelationshipTypeContract relationshipType) {
        this.relationshipType = relationshipType;
    }

    public IndividualContract getIndividualB() {
        return individualB;
    }

    public void setIndividualB(IndividualContract individualB) {
        this.individualB = individualB;
    }
}
