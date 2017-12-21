package org.openchs.healthmodule.adapter;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import org.openchs.dao.ConceptRepository;
import org.openchs.healthmodule.adapter.contract.*;
import org.openchs.healthmodule.adapter.contract.checklist.ChecklistRuleResponse;
import org.openchs.healthmodule.adapter.contract.enrolment.ProgramEnrolmentDecisionRuleResponse;
import org.openchs.healthmodule.adapter.contract.enrolment.ProgramEnrolmentRuleInput;
import org.openchs.healthmodule.adapter.contract.validation.ValidationsRuleResponse;
import org.openchs.web.request.ObservationRequest;
import org.openchs.web.request.ProgramEncounterRequest;

import javax.script.ScriptEngine;
import java.io.InputStream;
import java.util.List;

public class ProgramEnrolmentModuleInvoker extends HealthModuleInvoker {
    public ProgramEnrolmentModuleInvoker(ScriptEngine scriptEngine, InputStream inputStream) {
        super(scriptEngine, inputStream);
    }

    public List<ObservationRequest> getDecisions(ProgramEnrolmentRuleInput programEnrolmentRuleInput, ConceptRepository conceptRepository) {
        ScriptObjectMirror decision = executeRule(programEnrolmentRuleInput, "getDecisions");
        ProgramEnrolmentDecisionRuleResponse programEnrolmentDecisionRuleResponse = new ProgramEnrolmentDecisionRuleResponse(decision);
        List<DecisionRuleResponse> decisionRuleResponses = programEnrolmentDecisionRuleResponse.getDecisionRuleResponses();

        return getObservationRequests(conceptRepository, decisionRuleResponses);
    }

    private ScriptObjectMirror executeRule(ProgramEnrolmentRuleInput programEnrolmentRuleInput, String functionName) {
        return (ScriptObjectMirror) this.invoke(functionName, programEnrolmentRuleInput, programEnrolmentRuleInput.getProgramEnrolmentRequest().getEnrolmentDateTime().toDate());
    }

    public List<ProgramEncounterRequest> getNextScheduledVisits(ProgramEnrolmentRuleInput programEnrolmentRuleInput, String enrolmentUUID) {
        ScriptObjectMirror nextScheduledVisits = executeRule(programEnrolmentRuleInput, "getNextScheduledVisits");
        ProgramScheduledVisitsResponse programEnrolmentNextScheduledVisitsResponse = new ProgramScheduledVisitsResponse(nextScheduledVisits);
        return programEnrolmentNextScheduledVisitsResponse.getProgramEncounterRequests(enrolmentUUID);
    }

    public ChecklistRuleResponse getChecklist(ProgramEnrolmentRuleInput programEnrolmentRuleInput) {
        ScriptObjectMirror checklists = executeRule(programEnrolmentRuleInput, "getChecklists");
        if (checklists.containsKey("0")) {
            return new ChecklistRuleResponse((ScriptObjectMirror) checklists.get("0"));
        } else
            return null;
    }

    public ValidationsRuleResponse validate(ProgramEnrolmentRuleInput programEnrolmentRuleInput) {
        ScriptObjectMirror validationResults = executeRule(programEnrolmentRuleInput, "validate");
        if (validationResults.containsKey("0")) {
            return new ValidationsRuleResponse((ScriptObjectMirror) validationResults.get("0"));
        } else
            return null;
    }
}