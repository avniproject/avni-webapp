package org.avni.service;

import org.avni.server.service.ObservationService;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.avni.server.dao.ConceptRepository;
import org.avni.server.dao.IndividualRepository;
import org.avni.server.dao.LocationRepository;
import org.avni.server.domain.Concept;
import org.avni.server.domain.ConceptAnswer;
import org.avni.server.domain.ObservationCollection;
import org.avni.server.web.request.ObservationRequest;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.initMocks;

public class ObservationServiceTest {

    @Mock
    private ConceptRepository conceptRepository;
    @Mock
    private IndividualRepository individualRepository;
    @Mock
    private LocationRepository locationRepository;

    private ObservationService observationService;

    private String INDIVIDUAL_UUID = "0a1bf764-4576-4d71-b8ec-25895a113e81";

    @Before
    public void setup() {
        initMocks(this);
        observationService = new ObservationService(conceptRepository, individualRepository, locationRepository);
    }

    @Test
    public void shouldIgnoreObservationsWithNullEquivalentAnswers() {
        Concept abc = new Concept();
        Concept efg = new Concept();
        ConceptAnswer abc_efg = new ConceptAnswer();
        efg.setName("EFG");
        efg.setUuid("EFG-EFG");

        abc_efg.setAnswerConcept(efg);
        abc_efg.setConcept(abc);

        abc.setName("ABC");
        abc.setUuid("ABC-ABC");
        abc.setDataType("Coded");
        abc.setConceptAnswers(new HashSet<>());
        abc.addAnswer(abc_efg);

        when(conceptRepository.findByName("ABC")).thenReturn(abc);
        when(conceptRepository.findByName("EFG")).thenReturn(efg);

        ObservationRequest req0 = new ObservationRequest();
        ObservationRequest req1 = new ObservationRequest();
        ObservationRequest req2 = new ObservationRequest();
        ObservationRequest req3 = new ObservationRequest();

        req0.setConceptName("ABC");
        req0.setValue(null);
        req1.setConceptName("ABC");
        req1.setValue("null");
        req2.setConceptName("ABC");
        req2.setValue("NULL");
        req3.setConceptName("ABC");
        req3.setValue("EFG-EFG");

        List<ObservationRequest> requests = Arrays.asList(req0, req1, req2, req3);

        ObservationCollection observationCollection = observationService.createObservations(requests);

        Assert.assertEquals(1, observationCollection.size());
    }
}
