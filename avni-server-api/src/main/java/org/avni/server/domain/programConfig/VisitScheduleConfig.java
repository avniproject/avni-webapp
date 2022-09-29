package org.avni.server.domain.programConfig;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class VisitScheduleConfig extends ArrayList<Object> implements Serializable {
    public VisitScheduleConfig() {
    }

    public VisitScheduleConfig(List<Object> schedules) {
        this.clear();
        this.addAll(schedules);
    }

}
