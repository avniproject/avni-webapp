package org.openchs.projection;

import org.openchs.application.FormElement;
import org.openchs.application.Format;
import org.openchs.application.KeyValues;
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
}
