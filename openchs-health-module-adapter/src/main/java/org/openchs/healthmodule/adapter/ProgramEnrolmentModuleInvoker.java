package org.openchs.healthmodule.adapter;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import org.openchs.healthmodule.adapter.contract.ChecklistRuleResponse;
import org.openchs.healthmodule.adapter.contract.ProgramEnrolmentRuleInput;

import javax.script.ScriptEngine;
import java.io.File;

public class ProgramEnrolmentModuleInvoker extends HealthModuleInvoker {
    public ProgramEnrolmentModuleInvoker(ScriptEngine scriptEngine, File file) {
        super(scriptEngine, file);
    }

    public ChecklistRuleResponse getChecklist(ProgramEnrolmentRuleInput programEnrolmentRuleInput) {
        ScriptObjectMirror checklists = (ScriptObjectMirror) this.invoke("getChecklists", programEnrolmentRuleInput);
        if (checklists.containsKey("0"))
            return new ChecklistRuleResponse((ScriptObjectMirror) checklists.get("0"));
        else
            return null;
    }
}