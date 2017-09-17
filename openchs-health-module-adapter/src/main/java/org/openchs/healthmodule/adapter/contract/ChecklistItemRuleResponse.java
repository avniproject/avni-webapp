package org.openchs.healthmodule.adapter.contract;

import jdk.nashorn.api.scripting.ScriptObjectMirror;

import java.util.Date;

public class ChecklistItemRuleResponse extends RuleResponse {
    public ChecklistItemRuleResponse(ScriptObjectMirror scriptObjectMirror) {
        super(scriptObjectMirror);
    }

    public String getName() {
        return (String) scriptObjectMirror.get("name");
    }

    public Date getDueDate() {
        return getDate("dueDate");
    }

    public Date getMaxDate() {
        return getDate("maxDate");
    }
}