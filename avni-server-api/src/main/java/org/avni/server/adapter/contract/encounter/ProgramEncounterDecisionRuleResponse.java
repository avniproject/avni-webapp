package org.avni.server.adapter.contract.encounter;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import org.avni.server.adapter.contract.DecisionRuleResponse;
import org.avni.server.adapter.contract.RuleResponse;

import java.util.ArrayList;
import java.util.List;

public class ProgramEncounterDecisionRuleResponse extends RuleResponse {
    private List<DecisionRuleResponse> decisionRuleResponses = new ArrayList<>();

    public ProgramEncounterDecisionRuleResponse(ScriptObjectMirror scriptObjectMirror) {
        super(scriptObjectMirror);
        ScriptObjectMirror enrolmentDecisions = (ScriptObjectMirror) scriptObjectMirror.get("encounterDecisions");
        addToList(enrolmentDecisions, this.decisionRuleResponses, object -> new DecisionRuleResponse((ScriptObjectMirror) object));
    }

    public List<DecisionRuleResponse> getDecisionRuleResponses() {
        return decisionRuleResponses;
    }
}
