package org.openchs.domain;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "individual_relationship_type")
public class IndividualRelationshipType extends CHSEntity {

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

    private boolean isVoided = false;

    public IndividualRelation getIndividualAIsToB() {
        return individualAIsToB;
    }

    public void setIndividualAIsToB(IndividualRelation individualAIsToB) {
        this.individualAIsToB = individualAIsToB;
    }
    
    public static IndividualRelationshipType create(IndividualRelation relation, Gender gender, IndividualRelation reverseRelation) {
        IndividualRelationshipType reverseRelationEntity = new IndividualRelationshipType();
        reverseRelationEntity.individualAIsToB = relation;
        reverseRelationEntity.individualBIsToA = reverseRelation;
        return reverseRelationEntity;
    }

    public boolean isVoided() {
        return isVoided;
    }

    public void setVoided(boolean voided) {
        isVoided = voided;
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