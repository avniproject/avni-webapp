package org.openchs.healthmodule.adapter.contract;

import jdk.nashorn.api.scripting.ScriptObjectMirror;

import java.util.ArrayList;
import java.util.List;

public class ProgramEnrolmentDecisionRuleResponse {
    private List<DecisionRuleResponse> decisionRuleResponses = new ArrayList<>();

    public ProgramEnrolmentDecisionRuleResponse(ScriptObjectMirror scriptObjectMirror) {
        ScriptObjectMirror enrolmentDecisions = (ScriptObjectMirror) scriptObjectMirror.get("enrolmentDecisions");
        int length = enrolmentDecisions.getOwnKeys(false).length;
        for (int i = 0; i < length; i++) {
            this.decisionRuleResponses.add(new DecisionRuleResponse((ScriptObjectMirror) enrolmentDecisions.get(Integer.toString(i))));
        }
    }
}