package org.openchs.web.request.rules.response;

import org.openchs.web.request.ObservationContract;

import java.util.List;

public class RuleResponseEntity{
    private String status;
    private DecisionResponseEntity data;
    private List<ObservationContract> observation;
    private String message;

    public List<ObservationContract> getObservation() {
        return observation;
    }

    public void setObservation(List<ObservationContract> observation) {
        this.observation = observation;
    }

    public void setStatus(String status){
        this.status = status;
    }
    public String getStatus(){
        return this.status;
    }

    public DecisionResponseEntity getData() {
        return data;
    }

    public void setData(DecisionResponseEntity data) {
        this.data = data;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}