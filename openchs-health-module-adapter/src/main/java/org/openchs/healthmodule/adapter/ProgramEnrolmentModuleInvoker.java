package org.openchs.healthmodule.adapter;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import org.openchs.healthmodule.adapter.contract.ChecklistRuleResponse;
import org.openchs.healthmodule.adapter.contract.ProgramEnrolmentRuleInput;

public class ProgramEnrolmentModuleInvoker {
    private HealthModuleInvoker healthModuleInvoker;

    public ProgramEnrolmentModuleInvoker(HealthModuleInvoker healthModuleInvoker) {
        this.healthModuleInvoker = healthModuleInvoker;
    }

    public ChecklistRuleResponse getChecklist(ProgramEnrolmentRuleInput programEnrolmentRuleInput) {
        ScriptObjectMirror checklists = (ScriptObjectMirror) healthModuleInvoker.invoke("getChecklists", programEnrolmentRuleInput);
        return new ChecklistRuleResponse((ScriptObjectMirror) checklists.get("0"));
    }
}