package org.openchs.healthmodule.adapter;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import org.openchs.dao.ConceptRepository;
import org.openchs.healthmodule.adapter.contract.DecisionRuleResponse;
import org.openchs.healthmodule.adapter.contract.enrolment.ProgramEnrolmentDecisionRuleResponse;
import org.openchs.healthmodule.adapter.contract.enrolment.ProgramEnrolmentRuleInput;
import org.openchs.web.request.ObservationRequest;

import javax.script.ScriptEngine;
import java.io.InputStream;
import java.util.List;

public class ProgramEncounterRuleInvoker extends HealthModuleInvoker {
    public ProgramEncounterRuleInvoker(ScriptEngine scriptEngine, InputStream inputStream) {
        super(scriptEngine, inputStream);
    }

    public List<ObservationRequest> getDecisions(ProgramEnrolmentRuleInput programEnrolmentRuleInput, ConceptRepository conceptRepository) {
        ScriptObjectMirror decision = (ScriptObjectMirror) this.invoke("getDecisions", programEnrolmentRuleInput);
        ProgramEnrolmentDecisionRuleResponse programEnrolmentDecisionRuleResponse = new ProgramEnrolmentDecisionRuleResponse(decision);
        List<DecisionRuleResponse> decisionRuleResponses = programEnrolmentDecisionRuleResponse.getDecisionRuleResponses();

        return getObservationRequests(conceptRepository, decisionRuleResponses);
    }
}