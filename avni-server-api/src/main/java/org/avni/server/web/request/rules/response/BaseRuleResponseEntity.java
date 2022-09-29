package org.avni.server.web.request.rules.response;

public class BaseRuleResponseEntity {
    private String status;
    private RuleError error;

    public RuleError getError() {
        return error;
    }

    public void setError(RuleError error) {
        this.error = error;
    }

    public String getStatus() {
        return this.status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

}
