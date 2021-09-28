package org.avni.domain;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

public class JsonObject extends HashMap<String, Object> implements Serializable {
    public JsonObject() {
    }

    public JsonObject(Map<String, Object> userSettings) {
        this.putAll(userSettings);
    }

    public JsonObject with(String key, Object value) {
        super.put(key, value);
        return this;
    }
}
