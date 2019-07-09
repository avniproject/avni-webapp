package org.openchs.domain;

import org.openchs.application.projections.BaseProjection;
import org.springframework.data.rest.core.config.Projection;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "program")
public class Program extends OrganisationAwareEntity {
    @NotNull
    @Column
    private String name;

    private String colour;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getColour() {
        return colour;
    }

    public void setColour(String colour) {
        this.colour = colour;
    }

    @Projection(name = "ProgramProjection", types = {Program.class})
    public interface ProgramProjection extends BaseProjection {
        String getName();
    }
}
