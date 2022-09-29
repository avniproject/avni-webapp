package org.avni.server.projection;

import org.avni.server.application.FormElement;
import org.avni.server.application.Format;
import org.avni.server.application.KeyValues;
import org.springframework.data.rest.core.config.Projection;

@Projection(name = "FormElementWebProjection", types = {FormElement.class})
public interface FormElementWebProjection {
    String getUuid();
    boolean isVoided();
    String getName();
    Double getDisplayOrder();
    ConceptWebProjection getConcept();
    KeyValues getKeyValues();
    boolean isMandatory();
    String getType();
    Format getValidFormat();
    String getRule();
    FormElementWebProjection getGroup();
}
