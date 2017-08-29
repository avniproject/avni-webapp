package org.openchs.healthmodule.adapter.contract;

import jdk.nashorn.api.scripting.ScriptObjectMirror;

public class ChecklistRuleResponse {
    private final ScriptObjectMirror items;

    public ChecklistRuleResponse(ScriptObjectMirror scriptObjectMirror) {
        items = (ScriptObjectMirror) scriptObjectMirror.get("items");
    }

    public ChecklistItemRuleResponse getItem(int index) {
        ScriptObjectMirror scriptObjectMirror = (ScriptObjectMirror) items.get(Integer.toString(index));
        return new ChecklistItemRuleResponse(scriptObjectMirror);
    }

    public int getNumberOfItems() {
        return items.getOwnKeys(false).length;
    }
}