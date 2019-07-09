package org.openchs.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.openchs.application.projections.BaseProjection;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "program")
@JsonIgnoreProperties({"operationalPrograms"})
public class Program extends OrganisationAwareEntity {
    @NotNull
    @Column
    private String name;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "program")
    private Set<OperationalProgram> operationalPrograms = new HashSet<>();

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

    public Set<OperationalProgram> getOperationalPrograms() {
        return operationalPrograms;
    }

    public void setOperationalPrograms(Set<OperationalProgram> operationalPrograms) {
        this.operationalPrograms = operationalPrograms;
    }

    @JsonIgnore
    public String getOperationalProgramName() {
        return operationalPrograms.stream().map(OperationalProgram::getName).findFirst().orElse(null);
    }

    @Projection(name = "ProgramProjection", types = {Program.class})
    public interface ProgramProjection extends BaseProjection {
        String getName();

        String getColour();

        String getOperationalProgramName();
    }
}
