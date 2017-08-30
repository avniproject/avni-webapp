package org.openchs.healthmodule.adapter.contract;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import org.joda.time.DateTime;

import java.util.ArrayList;
import java.util.List;

public class ChecklistRuleResponse {
    private final String name;
    private DateTime baseDate;
    private List<ChecklistItemRuleResponse> items;

    public ChecklistRuleResponse(ScriptObjectMirror scriptObjectMirror) {
        baseDate = new DateTime(scriptObjectMirror.get("baseDate"));
        name = (String) scriptObjectMirror.get("name");
        ScriptObjectMirror responseItems = (ScriptObjectMirror) scriptObjectMirror.get("items");
        int length = responseItems.getOwnKeys(false).length;
        this.items = new ArrayList<>(length);
        for (int i = 0; i < length; i++) {
            this.items.add(new ChecklistItemRuleResponse((ScriptObjectMirror) responseItems.get(Integer.toString(i))));
        }
    }

    public DateTime getBaseDate() {
        return baseDate;
    }

    public String getName() {
        return name;
    }

    public List<ChecklistItemRuleResponse> getItems() {
        return items;
    }
}