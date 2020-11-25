package org.openchs.projection;

import org.openchs.application.projections.BaseProjection;
import org.openchs.domain.ConceptAnswer;
import org.springframework.data.rest.core.config.Projection;

@Projection(name = "ConceptAnswerWebProjection", types = {ConceptAnswer.class})
public interface ConceptAnswerWebProjection extends BaseProjection {
    ConceptLeafWebProjection getAnswerConcept();
    double getOrder();
    boolean isAbnormal();
    boolean isUnique();
    Boolean getVoided();
}
