package org.openchs.domain;

import org.openchs.application.projections.BaseProjection;
import org.springframework.data.rest.core.config.Projection;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "subject_type")
public class SubjectType extends OrganisationAwareEntity {
    @NotNull
    @Column
    private String name;


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Projection(name = "SubjectTypeProjection", types = {SubjectType.class})
    public interface SubjectTypeProjection extends BaseProjection {
        String getName();
    }
}
