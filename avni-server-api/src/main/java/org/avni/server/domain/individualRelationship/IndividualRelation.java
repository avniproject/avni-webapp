package org.avni.server.domain.individualRelationship;

import org.avni.server.domain.OrganisationAwareEntity;
import org.hibernate.annotations.BatchSize;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "individual_relation")
@BatchSize(size = 100)
public class IndividualRelation extends OrganisationAwareEntity {
    @NotNull
    private String name;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "relation")
    private Set<IndividualRelationGenderMapping> genderMappings = new HashSet<>();

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public static IndividualRelation create(String name) {
        IndividualRelation relation = new IndividualRelation();
        relation.name = name;
        return relation;
    }

    public Set<IndividualRelationGenderMapping> getGenderMappings() {
        return genderMappings;
    }

    public void setGenderMappings(Set<IndividualRelationGenderMapping> genderMappings) {
        this.genderMappings = genderMappings;
    }
}
