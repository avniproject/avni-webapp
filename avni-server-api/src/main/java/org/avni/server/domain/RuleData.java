package org.avni.server.domain;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

public class RuleData extends HashMap<String, String> implements Serializable {

    public RuleData() {
    }

    public RuleData(Map<String, String> data) {
        this.putAll(data);
    }
}
