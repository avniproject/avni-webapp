package org.openchs.projection;

import org.openchs.domain.Concept;
import org.springframework.data.rest.core.config.Projection;

@Projection(name = "ConceptWebProjection", types = {Concept.class})
public interface ConceptLeafWebProjection {
    String getUuid();
    boolean isVoided();
    String getName();
    String getDataType();
    Double getLowAbsolute();
    Double getHighAbsolute();
    Double getLowNormal();
    Double getHighNormal();
}
