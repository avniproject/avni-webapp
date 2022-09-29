package org.avni.web.response;

import org.avni.server.web.response.Response;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.avni.server.dao.ConceptRepository;
import org.avni.server.domain.Concept;
import org.avni.server.domain.ConceptAnswer;
import org.avni.server.domain.ObservationCollection;
import org.avni.server.service.ConceptService;

import java.util.*;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.Is.is;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.initMocks;

public class ResponseUnitTest {
    @Mock
    private ConceptRepository conceptRepository;
    @Mock
    private ConceptService conceptService;

    @Before
    public void setup() {
        initMocks(this);
    }

    @Test()
    public void shouldNotAlterExistingObsWhenPassedNullObservations() {

        LinkedHashMap<String, Object> parentMap = new LinkedHashMap<>();
        LinkedHashMap<String, Object> observationsResponse = new LinkedHashMap<>();
        observationsResponse.put("First Name", "Test");

        Response.putObservations(conceptRepository, conceptService, parentMap, observationsResponse, null);
        LinkedHashMap<String, Object> observations = (LinkedHashMap<String, Object>) parentMap.get("observations");
        assertThat(observations.size(), is(1));
        assertThat(observations.get("First Name"), is("Test"));
    }

    @Test()
    public void shouldNotAlterExistingObsWhenPassedEmptyObservations() throws Exception {

        LinkedHashMap<String, Object> parentMap = new LinkedHashMap<>();
        LinkedHashMap<String, Object> observationsResponse = new LinkedHashMap<>();
        observationsResponse.put("First Name", "Test");

        Response.putObservations(conceptRepository, conceptService, parentMap, observationsResponse, new ObservationCollection());
        LinkedHashMap<String, Object> observations = (LinkedHashMap<String, Object>) parentMap.get("observations");
        assertThat(observations.size(), is(1));
        assertThat(observations.get("First Name"), is("Test"));
    }

    @Test()
    public void shouldAddObservationsWhenPassedObsAreNotEmpty() {
        String questionConceptName = "ABC";
        String answerValue = "XYZ";
        LinkedHashMap<String, Object> parentMap = new LinkedHashMap<>();
        LinkedHashMap<String, Object> observationsResponse = new LinkedHashMap<>();
        observationsResponse.put("First Name", "Test");
        ObservationCollection observations = new ObservationCollection();
        String questionConceptUuid = "55f3e0cc-a9bc-45d6-a42c-a4fd3d90465f";
        String answerConceptUuid = "a33da2f8-7329-4e2a-8c27-046ee4082524";
        Concept questionConcept = new Concept();
        questionConcept.setName(questionConceptName);
        Concept answerConcept = new Concept();
        answerConcept.setUuid(answerConceptUuid);
        answerConcept.setName(answerValue);
        ConceptAnswer conceptAnswer = new ConceptAnswer();
        conceptAnswer.setConcept(answerConcept);
        Set<ConceptAnswer> answers = new HashSet<>();
        answers.add(conceptAnswer);
        questionConcept.setConceptAnswers(answers);
        observations.put(questionConceptUuid, answerConceptUuid);
        List<Map<String, String>> conceptMapList = new ArrayList<>();
        Map<String, String> conceptMap1 = new HashMap<>();
        conceptMap1.put("name",questionConceptName);
        conceptMap1.put("uuid",questionConceptUuid);
        Map<String, String> conceptMap2 = new HashMap<>();
        conceptMap2.put("name",answerValue);
        conceptMap2.put("uuid",answerConceptUuid);
        conceptMapList.add(conceptMap1);
        conceptMapList.add(conceptMap2);
        when(conceptRepository.getConceptUuidToNameMapList(anyString())).thenReturn(conceptMapList);
        when(conceptService.getObservationValue(anyMap(), anyString())).thenReturn(answerValue);
        Response.putObservations(conceptRepository, conceptService, parentMap, observationsResponse, observations);
        LinkedHashMap<String, Object> result = (LinkedHashMap<String, Object>) parentMap.get("observations");

        assertThat(result.get("First Name"), is("Test"));
        assertThat(result.get(questionConceptName), is(answerValue));
    }
}
