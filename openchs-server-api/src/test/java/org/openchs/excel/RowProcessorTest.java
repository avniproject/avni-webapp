package org.openchs.excel;

import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.domain.Concept;
import org.openchs.domain.ConceptAnswer;
import org.openchs.service.ChecklistService;
import org.openchs.web.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.Assert.assertEquals;

public class RowProcessorTest {
    @Mock
    private IndividualController individualController;

    @Mock
    private ProgramEnrolmentController programEnrolmentController;


    @Mock
    private ProgramEncounterController programEncounterController;


    @Mock
    private IndividualRepository individualRepository;

    @Mock
    private ChecklistController checklistController;

    @Mock
    private ChecklistItemController checklistItemController;

    @Mock
    private ChecklistService checklistService;

    @Mock
    private ConceptRepository conceptRepository;
    private RowProcessor rowProcessor;

    @Before
    public void setUp() throws Exception {
        MockitoAnnotations.initMocks(this);
        rowProcessor = new RowProcessor(individualController, programEnrolmentController, programEncounterController, individualRepository, checklistController, checklistItemController, checklistService, conceptRepository);
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
        List foundConcept = (List) rowProcessor.getPrimitiveValue(concept, "Answer Concept");
        assertEquals(1, foundConcept.size());
        assertEquals(answerConcept.getUuid(), foundConcept.get(0));
    }
}