package org.avni.server.domain;

import org.avni.server.application.projections.BaseProjection;
import org.hibernate.annotations.BatchSize;
import org.springframework.data.rest.core.config.Projection;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "gender")
@BatchSize(size = 100)
public class Gender extends OrganisationAwareEntity {
    @NotNull
    private String name;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="concept_id")
    private Concept concept;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Concept getConcept() {
        return concept;
    }

    public void setConcept(Concept concept) {
        this.concept = concept;
    }

    public static Gender create(String name) {
        Gender gender = new Gender();
        gender.name = name;
        return gender;
    }

    @Projection(name = "GenderProjection", types = {Gender.class})
    public interface GenderProjection extends BaseProjection {
        String getName();
    }
}
