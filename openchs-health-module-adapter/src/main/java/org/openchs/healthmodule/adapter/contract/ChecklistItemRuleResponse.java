package org.openchs.healthmodule.adapter.contract;

import jdk.nashorn.api.scripting.ScriptObjectMirror;

import java.util.Date;

public class ChecklistItemRuleResponse extends RuleResponse {
    private ScriptObjectMirror scriptObjectMirror;

    public ChecklistItemRuleResponse(ScriptObjectMirror scriptObjectMirror) {
        this.scriptObjectMirror = scriptObjectMirror;
    }

    public String getName() {
        return (String) scriptObjectMirror.get("name");
    }

    public Date getDueDate() {
        return getDate(scriptObjectMirror, "dueDate");
    }

    public Date getMaxDate() {
        return getDate(scriptObjectMirror, "maxDate");
    }
}