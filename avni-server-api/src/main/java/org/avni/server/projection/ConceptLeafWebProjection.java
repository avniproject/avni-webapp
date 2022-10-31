package org.avni.server.projection;

import org.avni.server.application.KeyValues;
import org.avni.server.domain.Concept;
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
    KeyValues getKeyValues();
    String getUnit();
}
