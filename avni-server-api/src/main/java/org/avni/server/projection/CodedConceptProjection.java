package org.avni.server.projection;

import org.avni.server.application.projections.BaseProjection;
import org.avni.server.domain.Concept;
import org.springframework.data.rest.core.config.Projection;

@Projection(name = "ConceptProjection", types = {Concept.class})
public interface CodedConceptProjection extends BaseProjection {
    String getName();
}
