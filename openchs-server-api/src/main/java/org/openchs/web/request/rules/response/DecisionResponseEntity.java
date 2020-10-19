package org.openchs.web.request.rules.response;

import org.openchs.web.request.ObservationContract;

import java.util.ArrayList;
import java.util.List;
public class DecisionResponseEntity {
    private List<DecisionResponse> enrolmentDecisions = new ArrayList<>();
    private List<DecisionResponse> encounterDecisions = new ArrayList<>();
    private List<DecisionResponse> registrationDecisions = new ArrayList<>();

    private List<ObservationContract> enrolmentObservations = new ArrayList<>();
    private List<ObservationContract> encounterObservations = new ArrayList<>();
    private List<ObservationContract> registrationObservations = new ArrayList<>();

    public void setEnrolmentDecisions(List<DecisionResponse> enrolmentDecisions){
        this.enrolmentDecisions = enrolmentDecisions;
    }
    public List<DecisionResponse> getEnrolmentDecisions(){
        return this.enrolmentDecisions;
    }
    public void setEncounterDecisions(List<DecisionResponse> encounterDecisions){
        this.encounterDecisions = encounterDecisions;
    }
    public List<DecisionResponse> getEncounterDecisions(){
        return this.encounterDecisions;
    }
    public void setRegistrationDecisions(List<DecisionResponse> registrationDecisions){
        this.registrationDecisions = registrationDecisions;
    }
    public List<DecisionResponse> getRegistrationDecisions(){
        return this.registrationDecisions;
    }

    public List<ObservationContract> getEnrolmentObservations() {
        return enrolmentObservations;
    }

    public void setEnrolmentObservations(List<ObservationContract> enrolmentObservations) {
        this.enrolmentObservations = enrolmentObservations;
    }

    public List<ObservationContract> getEncounterObservations() {
        return encounterObservations;
    }

    public void setEncounterObservations(List<ObservationContract> encounterObservations) {
        this.encounterObservations = encounterObservations;
    }

    public List<ObservationContract> getRegistrationObservations() {
        return registrationObservations;
    }

    public void setRegistrationObservations(List<ObservationContract> registrationObservations) {
        this.registrationObservations = registrationObservations;
    }
}