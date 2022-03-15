package org.avni.projection;

import org.avni.application.FormElement;
import org.avni.application.Format;
import org.avni.application.KeyValues;
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
