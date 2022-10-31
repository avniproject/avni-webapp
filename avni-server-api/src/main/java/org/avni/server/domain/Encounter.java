package org.avni.server.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.BatchSize;
import org.joda.time.DateTime;
import org.avni.server.application.projections.BaseProjection;
import org.avni.server.domain.EncounterType.EncounterTypeProjection;
import org.springframework.data.rest.core.config.Projection;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "encounter")
@JsonIgnoreProperties({"individual"})
@BatchSize(size = 100)
public class Encounter extends AbstractEncounter implements MessageableEntity {
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

    @Override
    @JsonIgnore
    public Long getEntityTypeId() {
        return getEncounterType().getId();
    }

    @Override
    @JsonIgnore
    public Long getEntityId() {
        return getId();
    }

    @Projection(name = "EncounterProjectionMinimal", types = {Encounter.class})
    public interface EncounterProjectionMinimal extends BaseProjection {
        EncounterTypeProjection getEncounterType();

        DateTime getEncounterDateTime();
    }
}
