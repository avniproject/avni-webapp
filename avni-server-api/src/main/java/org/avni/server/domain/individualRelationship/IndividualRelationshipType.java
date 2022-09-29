package org.avni.server.domain.individualRelationship;

import org.avni.server.domain.OrganisationAwareEntity;
import org.hibernate.annotations.BatchSize;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "individual_relationship_type")
@BatchSize(size = 100)
public class IndividualRelationshipType extends OrganisationAwareEntity {
    @NotNull
    private String name;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "individual_a_is_to_b_relation_id")
    private IndividualRelation individualAIsToB;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "individual_b_is_to_a_relation_id")
    private IndividualRelation individualBIsToA;

    public IndividualRelation getIndividualAIsToB() {
        return individualAIsToB;
    }

    public void setIndividualAIsToB(IndividualRelation individualAIsToB) {
        this.individualAIsToB = individualAIsToB;
    }

    public IndividualRelation getIndividualBIsToA() {
        return individualBIsToA;
    }

    public void setIndividualBIsToA(IndividualRelation individualBIsToA) {
        this.individualBIsToA = individualBIsToA;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
