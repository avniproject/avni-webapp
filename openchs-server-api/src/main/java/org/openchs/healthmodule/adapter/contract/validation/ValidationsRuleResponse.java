package org.openchs.healthmodule.adapter.contract.validation;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import org.openchs.healthmodule.adapter.contract.RuleResponse;
import org.openchs.healthmodule.adapter.contract.checklist.ChecklistItemRuleResponse;

import java.util.ArrayList;

public class ValidationsRuleResponse extends RuleResponse {
    public ValidationsRuleResponse(ScriptObjectMirror scriptObjectMirror) {
        super(scriptObjectMirror);

        ScriptObjectMirror responseItems = (ScriptObjectMirror) scriptObjectMirror.get("items");
//        this.validations = new ArrayList<>();
//        this.addToList(responseItems, items, object -> new ChecklistItemRuleResponse((ScriptObjectMirror) object));
    }
}