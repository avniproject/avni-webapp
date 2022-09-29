package org.avni.server.projection;

import org.avni.server.application.projections.BaseProjection;
import org.avni.server.domain.ConceptAnswer;
import org.springframework.data.rest.core.config.Projection;

@Projection(name = "ConceptAnswerWebProjection", types = {ConceptAnswer.class})
public interface ConceptAnswerWebProjection extends BaseProjection {
    ConceptLeafWebProjection getAnswerConcept();
    double getOrder();
    boolean isAbnormal();
    boolean isUnique();
    Boolean getVoided();
}
