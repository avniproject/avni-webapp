package org.openchs.web.request;

import org.openchs.domain.ObservationCollection;

import java.util.List;

public class RequestUtil {
    public static ObservationCollection fromObservationRequests(List<ObservationRequest> observationRequests) {
        ObservationCollection observationCollection = new ObservationCollection();
        observationRequests.stream().forEach(observationRequest -> observationCollection.put(observationRequest.getConceptUUID(), observationRequest.getValue()));
        return observationCollection;
    }
}