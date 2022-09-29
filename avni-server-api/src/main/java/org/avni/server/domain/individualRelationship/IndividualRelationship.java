package org.avni.server.domain.individualRelationship;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Type;
import org.joda.time.DateTime;
import org.avni.server.domain.Individual;
import org.avni.server.domain.ObservationCollection;
import org.avni.server.domain.OrganisationAwareEntity;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "individual_relationship")
@JsonIgnoreProperties({"individuala", "individualB"})
@BatchSize(size = 100)
public class IndividualRelationship extends OrganisationAwareEntity {
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "relationship_type_id")
    private IndividualRelationshipType relationship;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "individual_a_id")
    //Repository query parser fails if i name this individualA
    private Individual individuala;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "individual_b_id")
    private Individual individualB;

    @Column
    private DateTime enterDateTime;

    @Column
    private DateTime exitDateTime;

    @Column
    @Type(type = "observations")
    private ObservationCollection exitObservations;

    public IndividualRelationshipType getRelationship() {
        return relationship;
    }

    public void setRelationship(IndividualRelationshipType relationship) {
        this.relationship = relationship;
    }

    public Individual getIndividuala() {
        return individuala;
    }

    public void setIndividuala(Individual individualA) {
        this.individuala = individualA;
    }

    public Individual getIndividualB() {
        return individualB;
    }

    public void setIndividualB(Individual individualB) {
        this.individualB = individualB;
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

    public ObservationCollection getExitObservations() {
        return exitObservations;
    }

    public void setExitObservations(ObservationCollection exitObservations) {
        this.exitObservations = exitObservations;
    }
}
