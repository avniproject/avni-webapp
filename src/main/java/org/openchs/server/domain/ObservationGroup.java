package org.openchs.server.domain;

import org.hibernate.annotations.Type;
import org.joda.time.DateTime;
import org.joda.time.LocalDate;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.LinkedHashMap;
import java.util.Map;

@Entity
@Table(name = "ObservationGroup")
public class ObservationGroup extends CHSEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @Column
    @Type(type = "KeyValuesJson")
    private Map<String, Object> observations;

    @Column
    private DateTime encounterTime;

    @ManyToOne(fetch=FetchType.LAZY)
    @NotNull
    private Individual individual;

    public void addObservation(String key, Object value) {
        if (observations == null) observations = new LinkedHashMap<>();
        observations.put(key, value);
    }

    public Map<String, Object> getObservations() {
        return observations;
    }
}