package org.avni.projection;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import org.avni.application.KeyValues;
import org.avni.application.projections.BaseProjection;
import org.avni.domain.Concept;
import org.avni.domain.ConceptAnswer.ConceptAnswerProjection;
import org.springframework.data.rest.core.config.Projection;
import org.joda.time.DateTime;

import java.util.Set;

@Projection(name = "ConceptProjection", types = {Concept.class})
@JsonPropertyOrder({"id", "uuid", "name", "dataType", "lowAbsolute", "highAbsolute", "lowNormal", "highNormal", "conceptAnswers", "KeyValues"})
public interface ConceptProjection extends BaseProjection {

    String getName();

    String getDataType();

    Double getLowAbsolute();

    Double getHighAbsolute();

    Double getLowNormal();

    Double getHighNormal();

    String getUnit();

    KeyValues getKeyValues();

    Boolean getVoided();

    Boolean getActive();

    String getLastModifiedBy();

    String getCreatedBy();

    DateTime getCreatedDateTime();

    DateTime getLastModifiedDateTime();

    @JsonInclude(Include.NON_EMPTY)
    Set<ConceptAnswerProjection> getConceptAnswers();

}
