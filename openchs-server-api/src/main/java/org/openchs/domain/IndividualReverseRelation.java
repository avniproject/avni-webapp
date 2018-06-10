package org.openchs.domain;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "individual_reverse_relation_master")
public class IndividualReverseRelation extends CHSEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "relation_id")
    private IndividualRelation relation;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "individual_gender_id")
    private Gender gender;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reverse_relation_id")
    private IndividualRelation reverseRelation;

    private boolean isVoided = false;

    public IndividualRelation getRelation() {
        return relation;
    }

    public void setRelation(IndividualRelation relation) {
        this.relation = relation;
    }
    
    public static IndividualReverseRelation create(IndividualRelation relation, Gender gender, IndividualRelation reverseRelation) {
        IndividualReverseRelation reverseRelationEntity = new IndividualReverseRelation();
        reverseRelationEntity.relation = relation;
        reverseRelationEntity.gender = gender;
        reverseRelationEntity.reverseRelation = reverseRelation;
        return reverseRelationEntity;
    }

    public boolean isVoided() {
        return isVoided;
    }

    public void setVoided(boolean voided) {
        isVoided = voided;
    }

    public IndividualRelation getReverseRelation() {
        return reverseRelation;
    }

    public void setReverseRelation(IndividualRelation reverseRelation) {
        this.reverseRelation = reverseRelation;
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }
}