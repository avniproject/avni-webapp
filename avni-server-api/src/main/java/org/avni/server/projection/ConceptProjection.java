package org.avni.server.projection;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import org.avni.server.application.KeyValues;
import org.avni.server.application.projections.BaseProjection;
import org.avni.server.domain.Concept;
import org.avni.server.domain.ConceptAnswer;
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

    @JsonProperty("lastModifiedBy")
    String getLastModifiedByName();

    @JsonProperty("createdBy")
    String getCreatedByName();

    DateTime getCreatedDateTime();

    DateTime getLastModifiedDateTime();

    @JsonInclude(Include.NON_EMPTY)
    Set<ConceptAnswer.ConceptAnswerProjection> getConceptAnswers();

}
