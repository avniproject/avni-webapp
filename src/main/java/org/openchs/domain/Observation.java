package org.openchs.domain;

import com.fasterxml.jackson.annotation.JsonRawValue;

import java.io.Serializable;
import java.util.List;

public class Observation implements Serializable {
    private String conceptUUID;
    private Object valuePrimitive; // all primitives
    private List<String> valueCoded; // all coded

    @JsonRawValue
    public Object getValuePrimitive() {
        return valuePrimitive;
    }

    public void setValuePrimitive(Object valuePrimitive) {
        this.valuePrimitive = valuePrimitive;
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
        observation.setValuePrimitive(value);
        return observation;
    }

    public List<String> getValueCoded() {
        return valueCoded;
    }

    public void setValueCoded(List<String> valueCoded) {
        this.valueCoded = valueCoded;
    }
}