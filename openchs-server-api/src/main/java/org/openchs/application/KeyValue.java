package org.openchs.application;

import java.io.Serializable;

public class KeyValue implements Serializable {
    private String key;
    private Object value;

    public KeyValue() {
    }

    public KeyValue(String key, Object value) {
        this.key = key;
        this.value = value;
    }

    public KeyValue(KeyType keyType, Object value) {
        this(keyType.toString(), value);
    }

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