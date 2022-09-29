package org.avni.web.request;

import org.avni.server.web.request.IndividualRequest;
import org.avni.server.web.request.ObservationRequest;
import org.junit.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.Assert.assertEquals;

public class IndividualRequestTest {
    @Test
    public void addObservationShouldAppendForCodedAnswers() {
        IndividualRequest individualRequest = new IndividualRequest(new ArrayList<>());
        ObservationRequest observationRequest1 = createObservationRequest(Arrays.asList("VALUE-1", "VALUE-3"));
        ObservationRequest observationRequest2 = createObservationRequest(Arrays.asList("VALUE-1", "VALUE-2"));
        individualRequest.addObservation(observationRequest1);
        individualRequest.addObservation(observationRequest2);
        List<ObservationRequest> observations = individualRequest.getObservations();
        assertEquals(1, observations.size());
        assertEquals(3, ((List)observations.get(0).getValue()).size());
    }

    private ObservationRequest createObservationRequest(List<String> value) {
        ObservationRequest observationRequest = new ObservationRequest();
        observationRequest.setConceptName("MULTI-1");
        observationRequest.setValue(value);
        return observationRequest;
    }
}
