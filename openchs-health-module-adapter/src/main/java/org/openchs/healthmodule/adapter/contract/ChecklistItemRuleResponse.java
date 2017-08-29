package org.openchs.healthmodule.adapter.contract;

import jdk.nashorn.api.scripting.ScriptObjectMirror;

import java.util.Date;

public class ChecklistItemRuleResponse {
    private ScriptObjectMirror scriptObjectMirror;

    public ChecklistItemRuleResponse(ScriptObjectMirror scriptObjectMirror) {
        this.scriptObjectMirror = scriptObjectMirror;
    }

    public String getName() {
        return (String) scriptObjectMirror.get("name");
    }

    public Date getDueDate() {
        return (Date) scriptObjectMirror.get("dueDate");
    }

    public Date getMaxDate() {
        return (Date) scriptObjectMirror.get("maxDate");
    }
}