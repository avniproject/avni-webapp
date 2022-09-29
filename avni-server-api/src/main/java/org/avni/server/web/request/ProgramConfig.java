package org.avni.server.web.request;

import java.util.ArrayList;
import java.util.List;

public class ProgramConfig {
    private List<Object> visitSchedule;

    private List<ConceptContract> atRiskConcepts;

    public List<Object> getVisitSchedule() {
        return visitSchedule == null ? new ArrayList<>() : visitSchedule;
    }

    public void setVisitSchedule(List<Object> visitSchedule) {
        this.visitSchedule = visitSchedule;
    }

    public List<ConceptContract> getAtRiskConcepts() {
        return atRiskConcepts == null ? new ArrayList<>() : atRiskConcepts;
    }

    public void setAtRiskConcepts(List<ConceptContract> atRiskConcepts) {
        this.atRiskConcepts = atRiskConcepts;
    }
}
