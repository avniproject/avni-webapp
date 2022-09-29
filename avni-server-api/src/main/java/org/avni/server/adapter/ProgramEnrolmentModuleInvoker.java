package org.avni.server.adapter;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import org.avni.server.dao.ConceptRepository;
import org.avni.server.adapter.contract.checklist.ChecklistRuleResponse;
import org.avni.server.adapter.contract.enrolment.ProgramEnrolmentDecisionRuleResponse;
import org.avni.server.adapter.contract.enrolment.ProgramEnrolmentRuleInput;
import org.avni.server.adapter.contract.validation.ValidationsRuleResponse;
import org.avni.server.adapter.contract.DecisionRuleResponse;
import org.avni.server.adapter.contract.ProgramScheduledVisitsResponse;
import org.avni.server.web.request.ObservationRequest;
import org.avni.server.web.request.ProgramEncounterRequest;

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
