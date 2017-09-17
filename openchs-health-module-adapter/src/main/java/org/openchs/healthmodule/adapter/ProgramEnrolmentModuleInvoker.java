package org.openchs.healthmodule.adapter;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import org.openchs.dao.ConceptRepository;
import org.openchs.domain.Concept;
import org.openchs.healthmodule.adapter.contract.ChecklistRuleResponse;
import org.openchs.healthmodule.adapter.contract.DecisionRuleResponse;
import org.openchs.healthmodule.adapter.contract.ProgramEnrolmentDecisionRuleResponse;
import org.openchs.healthmodule.adapter.contract.ProgramEnrolmentRuleInput;
import org.openchs.web.request.ObservationRequest;

import javax.script.ScriptEngine;
import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

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

    public List<ObservationRequest> getDecisions(ProgramEnrolmentRuleInput programEnrolmentRuleInput, ConceptRepository conceptRepository) {
        ScriptObjectMirror decision = (ScriptObjectMirror) this.invoke("getDecisions", programEnrolmentRuleInput);
        ProgramEnrolmentDecisionRuleResponse programEnrolmentDecisionRuleResponse = new ProgramEnrolmentDecisionRuleResponse(decision);
        List<DecisionRuleResponse> decisionRuleResponses = programEnrolmentDecisionRuleResponse.getDecisionRuleResponses();
        List<ObservationRequest> observationRequests = new ArrayList<>();
        decisionRuleResponses.forEach(decisionRuleResponse -> {
            ObservationRequest observationRequest = new ObservationRequest();
            observationRequest.setConceptName(decisionRuleResponse.getName());

            if (decisionRuleResponse.getValue() instanceof List) {
                List conceptUUIDs = (List) ((List) decisionRuleResponse.getValue()).stream().map(o -> {
                    Concept concept = conceptRepository.findByName((String) o);
                    return concept.getUuid();
                }).collect(Collectors.toList());
                if (conceptUUIDs.size() != 0)
                    observationRequest.setValue(conceptUUIDs.toArray(new String[conceptUUIDs.size()]));
            } else {
                observationRequest.setValue(decisionRuleResponse.getValue());
                observationRequests.add(observationRequest);
            }
        });
        return observationRequests;
    }
}