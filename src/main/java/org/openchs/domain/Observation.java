package org.openchs.domain;

import com.fasterxml.jackson.annotation.JsonRawValue;

import java.io.Serializable;

public class Observation implements Serializable {
    private int concept;
    private Object value;

    public int getConcept() {
        return concept;
    }

    public void setConcept(int concept) {
        this.concept = concept;
    }

    @JsonRawValue
    public Object getValue() {
        return value;
    }

    public void setValue(Object value) {
        this.value = value;
    }

    public static Observation create(int concept, Object value) {
        Observation observation = new Observation();
        observation.setConcept(concept);
        observation.setValue(value);
        return observation;
    }
}