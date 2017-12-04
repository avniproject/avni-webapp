package org.openchs.domain;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "operational_encounter_type")
public class OperationalEncounterType extends OrganisationAwareEntity {
    @NotNull
    @ManyToOne(fetch= FetchType.LAZY)
    @JoinColumn(name="encounter_type_id")
    private EncounterType encounterType;

    public EncounterType getEncounterType() {
        return encounterType;
    }

    public void setEncounterType(EncounterType encounterType) {
        this.encounterType = encounterType;
    }

    public String getName() {
        return encounterType.getName();
    }

    public String getEncounterTypeUUID() {
        return encounterType.getUuid();
    }
}