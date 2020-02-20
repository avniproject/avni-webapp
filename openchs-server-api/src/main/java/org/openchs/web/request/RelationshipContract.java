package org.openchs.web.request;

import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.openchs.domain.individualRelationship.IndividualRelationshipType;

import java.util.List;

public class RelationshipContract extends ReferenceDataContract{
    private IndividualRelationshipTypeContract relationshipType = new IndividualRelationshipTypeContract();

    private IndividualContract individualB = new IndividualContract();

    private DateTime enterDateTime;

    private DateTime exitDateTime;

    private List<ObservationContract> exitObservations;

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
