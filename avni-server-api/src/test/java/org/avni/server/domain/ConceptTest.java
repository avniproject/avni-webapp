package org.avni.server.domain;

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
    public void getViewColumnNameForConcept() {
        Concept concept = createConcept("Short name");
        assertEquals(concept.getName(), concept.getViewColumnName());

        checkColumnName("Short name");
        checkColumnName("This name is longer than sixty three characters the maximum allowed limit by postgres");
        checkColumnName("Pinch the skin of the abdomen. Does it go back very easily and readily");
        checkColumnName("offer the child fluid, is the child unable to drink, etc etc etc etc etc");
    }

    private void checkColumnName(String s) {
        Concept concept = createConcept(s);
        assertTrue(concept.getViewColumnName(), concept.getViewColumnName().length() <= 63);
    }

    private Concept createConcept(String name) {
        Concept concept = new Concept();
        concept.setName(name);
        return concept;
    }
}
