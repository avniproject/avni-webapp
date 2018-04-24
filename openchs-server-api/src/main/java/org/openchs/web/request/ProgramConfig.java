package org.openchs.web.request;

import org.openchs.domain.programConfig.VisitScheduleConfig;

import java.util.List;
import java.util.Map;

public class ProgramConfig {
    private Map<String, List<Object>> visitSchedule;

    public Map<String, List<Object>> getVisitSchedule() {
        return visitSchedule;
    }

    public void setVisitSchedule(Map<String, List<Object>> visitSchedule) {
        this.visitSchedule = visitSchedule;
    }
}
