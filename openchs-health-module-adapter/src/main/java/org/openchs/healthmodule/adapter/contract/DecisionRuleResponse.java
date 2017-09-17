package org.openchs.healthmodule.adapter.contract;

import jdk.nashorn.api.scripting.ScriptObjectMirror;

public class DecisionRuleResponse {
    private final String name;
    private final Object value;

    public DecisionRuleResponse(ScriptObjectMirror scriptObjectMirror) {
        name = (String) scriptObjectMirror.get("name");
        value = scriptObjectMirror.get("value");
    }

    public String getName() {
        return name;
    }

    public Object getValue() {
        return value;
    }
}