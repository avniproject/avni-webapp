package org.avni.server.projection;

import org.avni.server.domain.Concept;
import org.springframework.data.rest.core.config.Projection;

import java.util.Set;

@Projection(name = "ConceptWebProjection", types = {Concept.class})
public interface ConceptWebProjection extends ConceptLeafWebProjection {
    Set<ConceptAnswerWebProjection> getConceptAnswers();
}
