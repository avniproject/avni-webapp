package org.openchs.application;

import java.io.Serializable;

public class KeyValue implements Serializable {
    private String key;
    private Object value;

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