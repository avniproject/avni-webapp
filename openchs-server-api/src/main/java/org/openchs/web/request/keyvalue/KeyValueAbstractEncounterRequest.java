package org.openchs.web.request.keyvalue;

import java.util.HashMap;
import java.util.Map;

public class KeyValueAbstractEncounterRequest extends org.openchs.web.request.common.CommonAbstractEncounterRequest {
    private Map<String, Object> observations = new HashMap<>();

    public Map<String, Object> getObservations() {
        return observations;
    }

    public void setObservations(Map<String, Object> observations) {
        this.observations = observations;
    }
}