package org.avni.server.domain;

import org.hibernate.annotations.BatchSize;
import org.joda.time.DateTime;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "operational_encounter_type")
@BatchSize(size = 100)
public class OperationalEncounterType extends OrganisationAwareEntity {
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encounter_type_id")
    private EncounterType encounterType;

    @Column
    private String name;

    public EncounterType getEncounterType() {
        return encounterType;
    }

    public void setEncounterType(EncounterType encounterType) {
        this.encounterType = encounterType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEncounterTypeUUID() {
        return encounterType.getUuid();
    }

    public Boolean getEncounterTypeVoided() {
        return encounterType.isVoided();
    }

    public String getEncounterTypeName() {
        return encounterType.getName();
    }

    public boolean getActive() {
        return encounterType.getActive();
    }

    public DateTime getLastModifiedDateTime() {
        return getEncounterType().getLastModifiedDateTime().isAfter(super.getLastModifiedDateTime()) ? getEncounterType().getLastModifiedDateTime() : super.getLastModifiedDateTime();
    }

    public String getEncounterEligibilityCheckRule() {
        return getEncounterType().getEncounterEligibilityCheckRule();
    }

    public DeclarativeRule getEncounterEligibilityCheckDeclarativeRule() {
        return getEncounterType().getEncounterEligibilityCheckDeclarativeRule();
    }

    public boolean getImmutable(){
        return encounterType.isImmutable();
    }
}
