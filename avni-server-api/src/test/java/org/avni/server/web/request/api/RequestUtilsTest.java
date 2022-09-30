package org.avni.server.web.request.api;

import org.avni.server.dao.ConceptRepository;
import org.avni.server.domain.Concept;
import org.avni.server.domain.ConceptDataType;
import org.avni.server.domain.ObservationCollection;
import org.avni.server.web.request.api.RequestUtils;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;

import java.util.*;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.initMocks;

public class RequestUtilsTest {
    private Map<String, Object> concepts = new HashMap<>();

    @Before
    public void setup() {
        initMocks(this);
        addConcept("FooString", ConceptDataType.Text);
        addConcept("FooInt", ConceptDataType.Numeric);
        addConcept("ChildQuestionGroup", ConceptDataType.QuestionGroup);
        addConcept("InsideQuestionGroupString", ConceptDataType.Text);
        addConcept("InsideQuestionGroupInt", ConceptDataType.Numeric);
    }

    private void addConcept(String fooString, ConceptDataType conceptDataType) {
        concepts.put(fooString, createConcept(fooString, conceptDataType));
    }

    private Concept createConcept(String name, ConceptDataType conceptDataType) {
        Concept concept = new Concept();
        concept.setUuid(String.format("%s-UUID", name));
        concept.setName(name);
        concept.setDataType(conceptDataType.name());
        return concept;
    }

    @Mock
    private ConceptRepository conceptRepository;

    @Test
    public void createObservations() {
        when(conceptRepository.findByName(anyString())).thenAnswer(i -> concepts.get(i.getArguments()[0]));
        Map<String, Object> observations = new HashMap<>();
        observations.put("FooString", "Bar");
        observations.put("FooInt", 38);
        HashMap<String, Object> childObservations = new HashMap<>();
        childObservations.put("InsideQuestionGroupString", "Baz");
        childObservations.put("InsideQuestionGroupInt", 33);
        List<HashMap<String, Object>> groupOfChildObservations = new ArrayList<>();
        groupOfChildObservations.add(childObservations);
        observations.put("ChildQuestionGroup", groupOfChildObservations);
        ObservationCollection observationsReturned = RequestUtils.createObservations(observations, conceptRepository);
        Assert.assertEquals(3, observationsReturned.size());

        List<ObservationCollection> groupOfObservationCollections = (List<ObservationCollection>) observationsReturned.get("ChildQuestionGroup-UUID");
        Assert.assertEquals(1, groupOfObservationCollections.size());
        Assert.assertEquals(2, groupOfChildObservations.get(0).size());
    }
}
