package org.openchs.web.request.rules.response;

import java.util.List;
public class DecisionResponseEntity {
    private List<DecisionResponse> enrolmentDecisions;
    private List<DecisionResponse> encounterDecisions;
    private List<DecisionResponse> registrationDecisions;

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
}