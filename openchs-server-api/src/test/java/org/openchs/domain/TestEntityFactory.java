package org.openchs.domain;

import java.util.HashSet;
import java.util.Map;
import java.util.UUID;

public class TestEntityFactory {
    public static Concept createCodedConcept(String name, Map<String, UUID> answers) {
        Concept concept = new Concept();
        concept.setName(name);
        concept.setDataType(ConceptDataType.Coded.toString());
        HashSet<ConceptAnswer> conceptAnswers = new HashSet<>();

        answers.forEach((k, v) -> {
            ConceptAnswer conceptAnswer = new ConceptAnswer();
            conceptAnswer.setUuid(UUID.randomUUID().toString());
            conceptAnswer.setConcept(concept);
            conceptAnswer.setAnswerConcept(createConceptOfNotType(v, k));
            conceptAnswers.add(conceptAnswer);
        });
        concept.setConceptAnswers(conceptAnswers);
        return concept;
    }

    public static Concept createConceptOfNotType(UUID uuid, String name) {
        Concept concept = new Concept();
        concept.setUuid(uuid.toString());
        concept.setDataType(ConceptDataType.NA.toString());
        concept.setName(name);
        return concept;
    }
}