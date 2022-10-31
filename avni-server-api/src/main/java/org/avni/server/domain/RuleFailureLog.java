package org.avni.server.domain;

import org.hibernate.annotations.BatchSize;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.UUID;

@Entity
@Table(name = "rule_failure_log")
@BatchSize(size = 100)
public class RuleFailureLog extends OrganisationAwareEntity{
    @Column
    @NotNull
    private String formId;
    @Column
    private String ruleType;
    @Column
    private String entityType;
    @Column
    private String entityId;
    @Column
    private String errorMessage;
    @Column
    private String stacktrace;
    @Column
    private String source;

    public String getFormId() {
        return formId;
    }

    public void setFormId(String formId) {
        this.formId = formId;
    }

    public String getRuleType() {
        return ruleType;
    }

    public void setRuleType(String ruleType) {
        this.ruleType = ruleType;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
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
    public String getSource() {
        return source;
    }
    public void setSource(String source) {
        this.source = source;
    }

    private static String getStackTrace(Exception e) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        e.printStackTrace(pw);
        return sw.toString();
    }

    public static RuleFailureLog createInstance(String formUuid,String ruleType,String entityId,String entityType,String source,Exception e){
        RuleFailureLog ruleFailureLog = new RuleFailureLog();
        ruleFailureLog.setFormId(formUuid);
        ruleFailureLog.setRuleType(ruleType);
        ruleFailureLog.setEntityId(entityId);
        ruleFailureLog.setEntityType(entityType);
        ruleFailureLog.setSource(source);
        ruleFailureLog.setErrorMessage(e.getMessage() != null ? e.getMessage() : "");
        ruleFailureLog.setStacktrace(getStackTrace(e));
        ruleFailureLog.setUuid(UUID.randomUUID().toString());
        return ruleFailureLog;
    }
}
