package org.openchs.projection;

import org.openchs.application.projections.BaseProjection;
import org.openchs.domain.Concept;
import org.springframework.data.rest.core.config.Projection;

@Projection(name = "ConceptProjection", types = {Concept.class})
public interface CodedConceptProjection extends BaseProjection {
    String getName();
}
