package org.avni.server.adapter.contract.validation;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import org.avni.server.adapter.contract.RuleResponse;

import java.util.ArrayList;
import java.util.List;

public class ValidationsRuleResponse extends RuleResponse {
    private final List<RuleValidationResult> validationResults;

    public ValidationsRuleResponse(ScriptObjectMirror scriptObjectMirror) {
        super(scriptObjectMirror);

        ScriptObjectMirror responseItems = (ScriptObjectMirror) scriptObjectMirror.get("items");
        this.validationResults = new ArrayList<>();
        this.addToList(responseItems, this.validationResults, object -> new RuleValidationResult((ScriptObjectMirror) object));
    }

    public List<RuleValidationResult> getValidationResults() {
        return validationResults;
    }

    @Override
    public String toString() {
        return "{" +
                "validationResults=" + validationResults.stream().map(Object::toString) +
                '}';
    }
}
