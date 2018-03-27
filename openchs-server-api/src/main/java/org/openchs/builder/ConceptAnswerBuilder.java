package org.openchs.builder;

import org.openchs.domain.Concept;
import org.openchs.domain.ConceptAnswer;

import java.util.UUID;

public class ConceptAnswerBuilder extends BaseBuilder<ConceptAnswer, ConceptAnswerBuilder> {
    public ConceptAnswerBuilder(Concept concept, ConceptAnswer existingEntity) {
        super(existingEntity, new ConceptAnswer());
        this.get().setConcept(concept);
        if (this.get().getUuid() == null) this.get().setUuid(UUID.randomUUID().toString());
    }

    public ConceptAnswerBuilder withAnswerConcept(Concept answerConcept) {
        this.set("AnswerConcept", answerConcept, Concept.class);
        return this;
    }

    public ConceptAnswerBuilder withOrder(short order) {
        this.set("Order", order, Short.class);
        return this;
    }

    public ConceptAnswerBuilder withAbnormal(Boolean abnormal) {
        this.set("Abnormal", abnormal, Boolean.class);
        return this;
    }
}
