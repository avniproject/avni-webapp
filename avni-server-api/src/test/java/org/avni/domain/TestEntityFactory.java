package org.avni.domain;

import org.avni.server.domain.Concept;
import org.avni.server.domain.ConceptAnswer;
import org.avni.server.domain.ConceptDataType;

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
            conceptAnswer.setAnswerConcept(createConceptOfNotType(v.toString(), k));
            conceptAnswers.add(conceptAnswer);
        });
        concept.setConceptAnswers(conceptAnswers);
        return concept;
    }

    public static Concept createConceptOfNotType(String uuid, String name) {
        Concept concept = new Concept();
        concept.setUuid(uuid);
        concept.setDataType(ConceptDataType.NA.toString());
        concept.setName(name);
        return concept;
    }
}
