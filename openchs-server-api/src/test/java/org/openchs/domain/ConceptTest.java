package org.openchs.domain;

import org.junit.Test;

import java.util.*;

import static org.junit.Assert.*;

public class ConceptTest {
    @Test
    public void getAnswerUUID() {
        HashMap<String, UUID> answers = new HashMap<>();
        answers.put("Male", UUID.randomUUID());
        UUID femaleUUID = UUID.randomUUID();
        answers.put("Female", femaleUUID);
        answers.put("Other", UUID.randomUUID());
        Concept concept = TestEntityFactory.createCodedConcept("Gender", answers);
        Concept femaleConcept = concept.findAnswerConcept("Female");
        assertEquals(femaleUUID.toString(), femaleConcept.getUuid());
    }

    @Test
    public void shouldReadCodedConceptAnswerAsAListOfUUIDS() throws Exception {
        Concept concept = Concept.create("Coded Concept", "Coded", "9a7db3b1-9e87-4d79-b9d4-4009c433832c");
        Concept answerConcept = Concept.create("Answer Concept", "Coded", "86e27fbc-c171-42d5-87ac-e01f83934de4");
        Set<ConceptAnswer> conceptAnswers = new HashSet<>();
        ConceptAnswer conceptAnswer = new ConceptAnswer();
        conceptAnswer.setConcept(concept);
        conceptAnswer.setAnswerConcept(answerConcept);
        conceptAnswer.setOrder((short) 1);
        conceptAnswers.add(conceptAnswer);
        concept.setConceptAnswers(conceptAnswers);
        List foundConcept = (List) concept.getPrimitiveValue("Answer Concept");
        assertEquals(1, foundConcept.size());
        assertEquals(answerConcept.getUuid(), foundConcept.get(0));
    }
}