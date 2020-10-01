package org.openchs.web.request.rules.validateRules;

import org.apache.logging.log4j.util.Strings;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.individualRelationship.RuleFailureLogRepository;
import org.openchs.domain.Concept;
import org.openchs.domain.ConceptDataType;
import org.openchs.domain.RuleFailureLog;
import org.openchs.web.request.rules.request.RequestEntityWrapper;
import org.openchs.web.request.rules.response.DecisionResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RuleValidationService {
    private final Logger logger;
    private final ConceptRepository conceptRepository;
    private final RuleFailureLogRepository ruleFailureLogRepository;

    @Autowired
    public RuleValidationService(
            ConceptRepository conceptRepository,
            RuleFailureLogRepository ruleFailureLogRepository) {
        logger = LoggerFactory.getLogger(this.getClass());
        this.conceptRepository = conceptRepository;
        this.ruleFailureLogRepository = ruleFailureLogRepository;
    }


    public RuleFailureLog generateRuleFailureLog(RequestEntityWrapper requestEntityWrapper, String source, String entityType, String entityUuid) {
        RuleFailureLog ruleFailureLog = new RuleFailureLog();
        ruleFailureLog.assignUUIDIfRequired();
        ruleFailureLog.setFormId(requestEntityWrapper.getRule().getFormUuid());
        ruleFailureLog.setRuleType(requestEntityWrapper.getRule().getRuleType());
        ruleFailureLog.setEntityId(entityUuid);
        ruleFailureLog.setEntityType(entityType);
        ruleFailureLog.setSource(source);
        return ruleFailureLog;
    }

    public List<DecisionResponse> validateDecision(List<DecisionResponse> decisionResponse, RuleFailureLog ruleFailureLog) {
        return decisionResponse
                .stream()
                .filter(decision -> checkConceptForRule(decision.getName(), ruleFailureLog))
                .map(decision -> filterDecisionValuesForCodedConcept(decision, ruleFailureLog))
                .filter(decision -> decision.getValue() != null)
                .collect(Collectors.toList());
    }

    private DecisionResponse filterDecisionValuesForCodedConcept(DecisionResponse decision, RuleFailureLog ruleFailureLog) {
        Concept concept = conceptRepository.findByName(decision.getName());
        if (concept.getDataType().equals(ConceptDataType.Coded.name())) {
            List<String> values = (List<String>) decision.getValue();
            List<String> filteredValues = values
                    .stream()
                    .filter(conceptName -> checkConceptForRule(conceptName, ruleFailureLog))
                    .collect(Collectors.toList());
            decision.setValue(filteredValues.isEmpty() ? null : filteredValues);
        }
        return decision;
    }

    private Boolean checkConceptForRule(String conceptName, RuleFailureLog ruleFailureLog) {
        Concept concept = conceptRepository.findByName(conceptName);
        if (concept == null) {
            ruleFailureLog.setErrorMessage(String.format("concept not found with the name %s", conceptName));
            ruleFailureLog.setStacktrace(Strings.EMPTY);
            ruleFailureLog.setUuid(UUID.randomUUID().toString());
            ruleFailureLogRepository.save(ruleFailureLog);
            return false;
        }
        return true;
    }
}
