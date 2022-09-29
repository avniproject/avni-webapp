package org.avni.server.importer.batch.csv.creator;

import org.avni.server.domain.ObservationCollection;
import org.avni.server.service.ObservationService;
import org.avni.server.web.request.rules.RulesContractWrapper.Decisions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class DecisionCreator {

    private ObservationService observationService;

    @Autowired
    public DecisionCreator(ObservationService observationService) {
        this.observationService = observationService;
    }

    public void addRegistrationDecisions(ObservationCollection observations, Decisions decisions) {
        if (decisions != null) {
            ObservationCollection observationsFromDecisions = observationService
                    .createObservationsFromDecisions(decisions.getRegistrationDecisions());
            observations.putAll(observationsFromDecisions);
        }
    }

    public void addEnrolmentDecisions(ObservationCollection observations, Decisions decisions) {
        if (decisions != null) {
            ObservationCollection observationsFromDecisions = observationService
                    .createObservationsFromDecisions(decisions.getEnrolmentDecisions());
            observations.putAll(observationsFromDecisions);
        }
    }

    public void addEncounterDecisions(ObservationCollection observations, Decisions decisions) {
        if (decisions != null) {
            ObservationCollection observationsFromDecisions = observationService
                    .createObservationsFromDecisions(decisions.getEncounterDecisions());
            observations.putAll(observationsFromDecisions);
        }
    }
}
