package org.avni.domain.individualRelationship;

import org.avni.domain.Gender;
import org.avni.domain.OrganisationAwareEntity;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "individual_relation_gender_mapping")
public class IndividualRelationGenderMapping extends OrganisationAwareEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "relation_id")
    private IndividualRelation relation;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gender_id")
    private Gender gender;

    public IndividualRelationGenderMapping() {
    }

    public IndividualRelationGenderMapping(IndividualRelation relation, Gender gender) {
        this.relation = relation;
        this.gender = gender;
    }

    public IndividualRelation getRelation() {
        return relation;
    }

    public void setRelation(IndividualRelation relation) {
        this.relation = relation;
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }
}
