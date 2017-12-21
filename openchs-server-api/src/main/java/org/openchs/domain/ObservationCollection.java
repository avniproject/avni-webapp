package org.openchs.domain;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class ObservationCollection extends HashMap<String, Object> implements Serializable {
    public ObservationCollection() {
    }

    public ObservationCollection(Map<String, Object> observations) {
        this.putAll(observations);
    }
}