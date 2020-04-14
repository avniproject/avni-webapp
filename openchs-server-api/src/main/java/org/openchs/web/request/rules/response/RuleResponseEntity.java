package org.openchs.web.request.rules.response;

public class RuleResponseEntity{
    private String status;
    private DecisionResponseEntity data;
    private String message;

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