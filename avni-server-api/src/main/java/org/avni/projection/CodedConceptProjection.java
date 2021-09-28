package org.avni.projection;

import org.avni.application.projections.BaseProjection;
import org.avni.domain.Concept;
import org.springframework.data.rest.core.config.Projection;

@Projection(name = "ConceptProjection", types = {Concept.class})
public interface CodedConceptProjection extends BaseProjection {
    String getName();
}
