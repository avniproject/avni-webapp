package org.avni.server.web.request.keyvalue;

import org.avni.server.web.request.common.CommonIndividualRequest;

import java.util.HashMap;
import java.util.Map;

public class KeyValueIndividualRequest extends CommonIndividualRequest {
    private Map<String, Object> observations = new HashMap<>();

    public Map<String, Object> getObservations() {
        return observations;
    }

    public void setObservations(Map<String, Object> observations) {
        this.observations = observations;
    }
}
