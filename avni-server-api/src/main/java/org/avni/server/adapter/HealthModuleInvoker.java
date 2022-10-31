package org.avni.server.adapter;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import org.avni.server.dao.ConceptRepository;
import org.avni.server.domain.Concept;
import org.avni.server.adapter.contract.DecisionRuleResponse;
import org.avni.server.web.request.ObservationRequest;

import javax.script.ScriptEngine;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public abstract class HealthModuleInvoker {
    protected ScriptObjectMirror eval;

    public HealthModuleInvoker(ScriptEngine scriptEngine, InputStream inputStream) {
        try {
            scriptEngine.eval("var console = {log: function(x){}};");
            eval = (ScriptObjectMirror) scriptEngine.eval(new InputStreamReader(inputStream));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    protected Object invoke(String functionName, Object... args) {
        try {
            return eval.callMember(functionName, args);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    protected List<ObservationRequest> getObservationRequests(ConceptRepository conceptRepository, List<DecisionRuleResponse> decisionRuleResponses) {
        List<ObservationRequest> observationRequests = new ArrayList<>();
        decisionRuleResponses.forEach(decisionRuleResponse -> {
            ObservationRequest observationRequest = new ObservationRequest();
            observationRequest.setConceptName(decisionRuleResponse.getName());

            if (decisionRuleResponse.getValue() instanceof List) {
                List conceptUUIDs = (List) ((List) decisionRuleResponse.getValue()).stream().map(o -> {
                    Concept concept = conceptRepository.findByName((String) o);
                    return concept.getUuid();
                }).collect(Collectors.toList());
                if (conceptUUIDs.size() != 0) {
                    observationRequest.setValue(conceptUUIDs.toArray(new String[conceptUUIDs.size()]));
                    observationRequests.add(observationRequest);
                }
            } else {
                observationRequest.setValue(decisionRuleResponse.getValue());
                observationRequests.add(observationRequest);
            }
        });
        return observationRequests;
    }
}
