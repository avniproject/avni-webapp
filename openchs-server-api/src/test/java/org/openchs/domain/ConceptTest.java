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
}