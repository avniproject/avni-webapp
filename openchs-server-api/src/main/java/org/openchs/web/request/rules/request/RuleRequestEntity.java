package org.openchs.web.request.rules.request;

public class RuleRequestEntity {
    private String formUuid;
    private String ruleType;
    private String workFlowType;
    private String code;

    public String getFormUuid() {
        return formUuid;
    }

    public void setFormUuid(String formUuid) {
        this.formUuid = formUuid;
    }

    public String getRuleType() {
        return ruleType;
    }

    public void setRuleType(String ruleType) {
        this.ruleType = ruleType;
    }

    public String getWorkFlowType() {
        return workFlowType;
    }

    public void setWorkFlowType(String workFlowType) {
        this.workFlowType = workFlowType;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
