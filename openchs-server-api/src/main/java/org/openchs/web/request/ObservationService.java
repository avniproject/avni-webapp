package org.openchs.web.request;

import org.openchs.dao.ConceptRepository;
import org.openchs.domain.ObservationCollection;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ObservationService {
    private ConceptRepository conceptRepository;

    @Autowired
    public ObservationService(ConceptRepository conceptRepository) {
        this.conceptRepository = conceptRepository;
    }

    public ObservationCollection createObservations(List<ObservationRequest> observationRequests) {
        List<ObservationRequest> completedObservationRequests = observationRequests
                .parallelStream()
                .map(observationRequest -> {
                    if (observationRequest.getConceptUUID() == null && observationRequest.getConceptName() != null) {
                        String conceptUUID = conceptRepository
                                .findByName(observationRequest.getConceptName()).getUuid();
                        observationRequest.setConceptUUID(conceptUUID);
                    }
                    return observationRequest;
                }).collect(Collectors.toList());
        return new ObservationCollection(completedObservationRequests
                .parallelStream()
                .collect(Collectors.toConcurrentMap(ObservationRequest::getConceptUUID, ObservationRequest::getValue)));
    }
}