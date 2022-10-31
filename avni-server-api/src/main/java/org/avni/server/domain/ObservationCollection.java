package org.avni.server.domain;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

public class ObservationCollection extends HashMap<String, Object> implements Serializable {
    public ObservationCollection() {
    }

    public ObservationCollection(Map<String, Object> observations) {
        this.putAll(observations);
    }

    public String getStringValue(Object key) {
        Object value = this.getOrDefault(key, null);
       return value == null ? null : value.toString();
    }
}
