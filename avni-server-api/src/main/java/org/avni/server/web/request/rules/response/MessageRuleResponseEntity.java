package org.avni.server.web.request.rules.response;

public class MessageRuleResponseEntity extends BaseRuleResponseEntity{
    private String[] parameters;

    public String[] getParameters() {
        return parameters;
    }

    public void setParameters(String[] parameters) {
        this.parameters = parameters;
    }
}
