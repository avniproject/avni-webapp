package org.openchs.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.joda.time.DateTime;
import org.openchs.application.projections.BaseProjection;
import org.openchs.domain.EncounterType.EncounterTypeProjection;
import org.springframework.data.rest.core.config.Projection;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "encounter")
@JsonIgnoreProperties({"individual"})
public class Encounter extends AbstractEncounter {
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "individual_id")
    private Individual individual;

    public Individual getIndividual() {
        return individual;
    }

    public void setIndividual(Individual individual) {
        this.individual = individual;
    }

    @Projection(name = "EncounterProjectionMinimal", types = {Encounter.class})
    public interface EncounterProjectionMinimal extends BaseProjection {
        EncounterTypeProjection getEncounterType();

        DateTime getEncounterDateTime();
    }
}