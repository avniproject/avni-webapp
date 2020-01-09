package org.openchs.projection;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import org.openchs.application.projections.BaseProjection;
import org.openchs.domain.Concept;
import org.openchs.domain.ConceptAnswer.ConceptAnswerProjection;
import org.springframework.data.rest.core.config.Projection;
import org.joda.time.DateTime;

import java.util.Set;

@Projection(name = "ConceptProjection", types = {Concept.class})
@JsonPropertyOrder({"id", "uuid", "name", "dataType", "lowAbsolute", "highAbsolute", "lowNormal", "highNormal", "conceptAnswers"})
public interface ConceptProjection extends BaseProjection {

    String getName();

    String getDataType();

    Double getLowAbsolute();

    Double getHighAbsolute();

    Double getLowNormal();

    Double getHighNormal();

    String getUnit();

    Boolean getVoided();

    String getLastModifiedBy();

    String getCreatedBy();

    DateTime getCreatedDateTime();

    DateTime getLastModifiedDateTime();

    @JsonInclude(Include.NON_EMPTY)
    Set<ConceptAnswerProjection> getConceptAnswers();

}
