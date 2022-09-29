package org.avni.server.adapter.contract;

import jdk.nashorn.api.scripting.ScriptObjectMirror;

public class DecisionRuleResponse extends RuleResponse {
    private final String name;
    private final Object value;

    public DecisionRuleResponse(ScriptObjectMirror scriptObjectMirror) {
        super(scriptObjectMirror);
        name = (String) scriptObjectMirror.get("name");
        value = this.getUnderlyingValue("value", x -> x);
    }

    public String getName() {
        return name;
    }

    public Object getValue() {
        return value;
    }
}
