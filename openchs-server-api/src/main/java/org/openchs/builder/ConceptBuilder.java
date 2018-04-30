package org.openchs.builder;

import org.openchs.domain.Concept;
import org.openchs.domain.ConceptAnswer;
import org.openchs.domain.ConceptDataType;
import org.openchs.framework.ApplicationContextProvider;
import org.openchs.service.ConceptService;
import org.openchs.util.O;
import org.openchs.web.request.ConceptContract;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

public class ConceptBuilder extends BaseBuilder<Concept, ConceptBuilder> {
    private final ConceptService conceptService;

    public ConceptBuilder(Concept existingEntity) {
        super(existingEntity, new Concept());
        conceptService = ApplicationContextProvider.getContext().getBean(ConceptService.class);
    }

    public ConceptBuilder withName(String name) {
        this.set("Name", name, String.class);
        return this;
    }

    public ConceptBuilder withDataType(String dataType) {
        this.set("DataType", dataType, String.class);
        return this;
    }

    public ConceptBuilder withNumericParams(Double highAbsolute, Double highNormal, Double lowAbsolute, Double lowNormal, String unit) {
        this.set("HighAbsolute", highAbsolute, Double.class);
        this.set("HighNormal", highNormal, Double.class);
        this.set("LowAbsolute", lowAbsolute, Double.class);
        this.set("LowAbsolute", lowAbsolute, Double.class);
        this.set("Unit", unit, String.class);
        return this;
    }

    public ConceptBuilder withVoided(Boolean voided) {
        this.set("Voided", voided, Boolean.class);
        return this;
    }

    private ConceptAnswer getExistingConceptAnswer(String conceptAnswerUUID) {
        return this.get().getConceptAnswers().stream()
                .filter(answer -> answer.getAnswerConcept().getUuid().equals(conceptAnswerUUID))
                .findFirst()
                .orElse(conceptService.getAnswer(this.get().getUuid(), conceptAnswerUUID));
    }

    public ConceptBuilder withConceptAnswers(List<ConceptContract> answers) {
        if (answers == null) return this;
        answers = (List<ConceptContract>) O.coalesce(answers, new ArrayList<>());
        AtomicInteger atomicInteger = new AtomicInteger(0);
        List<ConceptAnswer> conceptAnswers = answers.stream().map(answer -> {
            ConceptAnswer existingConceptAnswer = getExistingConceptAnswer(answer.getUuid());
            ConceptAnswerBuilder conceptAnswerBuilder = new ConceptAnswerBuilder(this.get(), existingConceptAnswer);
            Concept answerConcept = existingConceptAnswer == null ? conceptService.get(answer.getUuid())
                    : existingConceptAnswer.getAnswerConcept();
            conceptAnswerBuilder
                    .withAnswerConcept(answerConcept)
                    .withOrder((short) atomicInteger.incrementAndGet())
                    .withAbnormal(answer.isAbnormal())
                    .withUnique(answer.isUnique());
            return conceptAnswerBuilder.build();
        }).collect(Collectors.toList());
        this.get().addAll(conceptAnswers);
        return this;
    }

}
