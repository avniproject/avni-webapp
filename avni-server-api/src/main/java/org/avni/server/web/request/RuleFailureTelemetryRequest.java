package org.avni.server.web.request;

import org.joda.time.DateTime;

public class RuleFailureTelemetryRequest {

    private String uuid;
    private String individualUuid;
    private String ruleUuid;
    private String errorMessage;
    private String stacktrace;
    private DateTime errorDateTime;

    public Boolean getClosed() {
        return closed;
    }

    public void setClosed(Boolean closed) {
        this.closed = closed;
    }

    private Boolean closed;

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getIndividualUuid() {
        return individualUuid;
    }

    public void setIndividualUuid(String individualUuid) {
        this.individualUuid = individualUuid;
    }

    public String getRuleUuid() {
        return ruleUuid;
    }

    public void setRuleUuid(String ruleUuid) {
        this.ruleUuid = ruleUuid;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getStacktrace() {
        return stacktrace;
    }

    public void setStacktrace(String stacktrace) {
        this.stacktrace = stacktrace;
    }

    public DateTime getErrorDateTime() {
        return errorDateTime;
    }

    public void setErrorDateTime(DateTime errorDateTime) {
        this.errorDateTime = errorDateTime;
    }
}
