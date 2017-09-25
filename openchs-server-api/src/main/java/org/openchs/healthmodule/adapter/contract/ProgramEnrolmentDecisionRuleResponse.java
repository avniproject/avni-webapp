package org.openchs.healthmodule.adapter.contract;

import jdk.nashorn.api.scripting.ScriptObjectMirror;

import java.util.ArrayList;
import java.util.List;

public class ProgramEnrolmentDecisionRuleResponse extends RuleResponse {
    private List<DecisionRuleResponse> decisionRuleResponses = new ArrayList<>();

    public ProgramEnrolmentDecisionRuleResponse(ScriptObjectMirror scriptObjectMirror) {
        super(scriptObjectMirror);
        ScriptObjectMirror enrolmentDecisions = (ScriptObjectMirror) scriptObjectMirror.get("enrolmentDecisions");
        addToList(enrolmentDecisions, this.decisionRuleResponses, object -> new DecisionRuleResponse((ScriptObjectMirror) object));
    }

    public List<DecisionRuleResponse> getDecisionRuleResponses() {
        return decisionRuleResponses;
    }
}