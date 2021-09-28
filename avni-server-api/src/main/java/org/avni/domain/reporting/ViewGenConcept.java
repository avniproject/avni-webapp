package org.avni.domain.reporting;

import org.avni.domain.Concept;

public class ViewGenConcept {
    private Concept concept;
    private String conceptMapName;
    private boolean isDecisionConcept;

    public ViewGenConcept(Concept concept, String conceptMapName, boolean isDecisionConcept) {
        this.concept = concept;
        this.conceptMapName = conceptMapName;
        this.isDecisionConcept = isDecisionConcept;
    }

    public Concept getConcept() {
        return concept;
    }

    public String getConceptMapName() {
        return conceptMapName;
    }

    public boolean isDecisionConcept() {
        return isDecisionConcept;
    }
}
