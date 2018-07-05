package org.openchs.domain.individualRelationship;

import org.openchs.domain.Gender;
import org.openchs.domain.OrganisationAwareEntity;

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