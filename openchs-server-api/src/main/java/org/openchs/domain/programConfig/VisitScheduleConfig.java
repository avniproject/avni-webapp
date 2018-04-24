package org.openchs.domain.programConfig;

import java.io.Serializable;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class VisitScheduleConfig extends HashMap<String, List<Object>> implements Serializable {
    public VisitScheduleConfig() {
    }

    public VisitScheduleConfig(Map<String, List<Object>> schedules) {
        this.putAll(schedules);
    }

}
