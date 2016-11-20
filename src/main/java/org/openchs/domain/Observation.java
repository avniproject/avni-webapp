package org.openchs.domain;

import com.fasterxml.jackson.annotation.JsonRawValue;

import java.io.Serializable;

public class Observation implements Serializable {
    private String conceptUUID;
    private Object value;

    @JsonRawValue
    public Object getValue() {
        return value;
    }

    public void setValue(Object value) {
        this.value = value;
    }

    public String getConceptUUID() {
        return conceptUUID;
    }

    public void setConceptUUID(String conceptUUID) {
        this.conceptUUID = conceptUUID;
    }

    public static Observation create(String conceptUUID, Object value) {
        Observation observation = new Observation();
        observation.setConceptUUID(conceptUUID);
        observation.setValue(value);
        return observation;
    }
}