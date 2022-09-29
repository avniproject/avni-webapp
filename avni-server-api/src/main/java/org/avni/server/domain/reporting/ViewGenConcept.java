package org.avni.server.domain.reporting;

import org.avni.server.domain.Concept;

import static java.lang.String.format;

public class ViewGenConcept {
    private Concept concept;
    private Concept parentConcept;
    private String conceptMapName;
    private boolean isDecisionConcept;

    public ViewGenConcept(Concept concept, String conceptMapName, boolean isDecisionConcept, Concept parentConcept) {
        this.concept = concept;
        this.conceptMapName = conceptMapName;
        this.isDecisionConcept = isDecisionConcept;
        this.parentConcept = parentConcept;
    }

    public Concept getConcept() {
        return concept;
    }

    public String getJsonbExtractor() {
        if (parentConcept != null) {
            return format("-> '%s' -> '%s'", parentConcept.getUuid(), concept.getUuid());
        }
        return format("-> '%s'", concept.getUuid());
    }

    public String getTextExtractor() {
        if (parentConcept != null) {
            return format("-> '%s' ->> '%s'", parentConcept.getUuid(), concept.getUuid());
        }
        return format("->> '%s'", concept.getUuid());
    }

    public String getViewColumnName() {
        String name = concept.getViewColumnName();
        return parentConcept == null ? name : parentConcept.getViewColumnName() + " " + name;
    }

    public String getConceptMapName() {
        return conceptMapName;
    }

    public boolean isDecisionConcept() {
        return isDecisionConcept;
    }
}
