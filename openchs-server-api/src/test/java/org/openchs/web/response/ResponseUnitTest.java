package org.openchs.web.response;

import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.openchs.dao.ConceptRepository;
import org.openchs.domain.Concept;
import org.openchs.domain.ObservationCollection;
import org.openchs.service.ConceptService;

import java.util.LinkedHashMap;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.Is.is;
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
        Concept questionConcept = new Concept();
        questionConcept.setName(questionConceptName);
        observations.put(questionConceptUuid, answerValue);
        when(conceptRepository.findByUuid(questionConceptUuid)).thenReturn(questionConcept);
        when(conceptService.getObservationValue(questionConcept, answerValue)).thenReturn(answerValue);

        Response.putObservations(conceptRepository, conceptService, parentMap, observationsResponse, observations);
        LinkedHashMap<String, Object> result = (LinkedHashMap<String, Object>) parentMap.get("observations");

        assertThat(result.get("First Name"), is("Test"));
        assertThat(result.get(questionConceptName), is("XYZ"));
    }
}
