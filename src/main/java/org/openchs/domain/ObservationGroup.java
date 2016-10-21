package org.openchs.domain;

import org.hibernate.annotations.Type;
import org.joda.time.DateTime;
import org.postgresql.util.PGobject;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.sql.SQLException;

@Entity
@Table(name = "observation_group")
public class ObservationGroup extends CHSEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @Column
    @Type(type = "KeyValuesJson")
    private Object observations;

    @Column
    private DateTime encounterTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    private Individual individual;

    public void addObservation(String key, Object value) throws SQLException {
        PGobject pgObject = new PGobject();
        if (observations == null) observations = new PGobject();
        pgObject.setType("KeyValuesJson");
        pgObject.setValue("{'a':1}");
        observations = pgObject;
    }

    public void setIndividual(Individual individual) {
        this.individual = individual;
    }

    public Object getObservations() {
        return observations;
    }

    public Individual getIndividual() {
        return individual;
    }
}