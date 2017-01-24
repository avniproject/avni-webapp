package org.openchs.application;

import com.fasterxml.jackson.annotation.JsonRawValue;

import java.io.Serializable;

public class KeyValue implements Serializable {
    private String key;
    private Object value;

    @JsonRawValue
    public Object getValue() {
        return value;
    }

    public void setValue(Object value) {
        this.value = value;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }
}