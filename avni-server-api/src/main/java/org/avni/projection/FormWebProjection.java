package org.avni.projection;

import org.avni.application.Form;
import org.avni.application.FormType;
import org.springframework.data.rest.core.config.Projection;

import java.util.Set;

@Projection(name = "FormWebProjection", types = {Form.class})
public interface FormWebProjection {
    String getUuid();
    boolean isVoided();
    String getName();
    Set<FormElementGroupWebProjection> getFormElementGroups();
    FormType getFormType();
    Set<ConceptWebProjection> getDecisionConcepts();
}
