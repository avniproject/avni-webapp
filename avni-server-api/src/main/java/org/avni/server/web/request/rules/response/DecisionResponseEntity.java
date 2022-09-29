package org.avni.server.web.request.rules.response;

import org.avni.server.web.request.ObservationContract;

import java.util.ArrayList;
import java.util.List;
public class DecisionResponseEntity {
    private List<KeyValueResponse> enrolmentDecisions = new ArrayList<>();
    private List<KeyValueResponse> encounterDecisions = new ArrayList<>();
    private List<KeyValueResponse> registrationDecisions = new ArrayList<>();

    private List<ObservationContract> enrolmentObservations = new ArrayList<>();
    private List<ObservationContract> encounterObservations = new ArrayList<>();
    private List<ObservationContract> registrationObservations = new ArrayList<>();

    public void setEnrolmentDecisions(List<KeyValueResponse> enrolmentDecisions){
        this.enrolmentDecisions = enrolmentDecisions;
    }
    public List<KeyValueResponse> getEnrolmentDecisions(){
        return this.enrolmentDecisions;
    }
    public void setEncounterDecisions(List<KeyValueResponse> encounterDecisions){
        this.encounterDecisions = encounterDecisions;
    }
    public List<KeyValueResponse> getEncounterDecisions(){
        return this.encounterDecisions;
    }
    public void setRegistrationDecisions(List<KeyValueResponse> registrationDecisions){
        this.registrationDecisions = registrationDecisions;
    }
    public List<KeyValueResponse> getRegistrationDecisions(){
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
