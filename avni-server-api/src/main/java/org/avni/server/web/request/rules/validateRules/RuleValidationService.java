package org.avni.server.web.request.rules.validateRules;

import org.apache.logging.log4j.util.Strings;
import org.avni.server.dao.ConceptRepository;
import org.avni.server.dao.individualRelationship.RuleFailureLogRepository;
import org.avni.server.domain.Concept;
import org.avni.server.domain.ConceptDataType;
import org.avni.server.domain.RuleFailureLog;
import org.avni.server.web.request.rules.request.BaseRuleRequest;
import org.avni.server.web.request.rules.response.KeyValueResponse;
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


    public RuleFailureLog generateRuleFailureLog(BaseRuleRequest rule, String source, String entityType, String entityUuid) {
        RuleFailureLog ruleFailureLog = new RuleFailureLog();
        ruleFailureLog.assignUUIDIfRequired();
        ruleFailureLog.setFormId(rule.getFormUuid());
        ruleFailureLog.setRuleType(rule.getRuleType());
        ruleFailureLog.setEntityId(entityUuid);
        ruleFailureLog.setEntityType(entityType);
        ruleFailureLog.setSource(source);
        return ruleFailureLog;
    }

    public List<KeyValueResponse> validateDecision(List<KeyValueResponse> keyValueResponse, RuleFailureLog ruleFailureLog) {
        return keyValueResponse
                .stream()
                .filter(decision -> checkConceptForRule(decision.getName(), ruleFailureLog))
                .map(decision -> filterDecisionValuesForCodedConcept(decision, ruleFailureLog))
                .filter(decision -> decision.getValue() != null)
                .collect(Collectors.toList());
    }

    private KeyValueResponse filterDecisionValuesForCodedConcept(KeyValueResponse decision, RuleFailureLog ruleFailureLog) {
        Concept concept = conceptRepository.findByName(decision.getName());
        if (concept.getDataType().equals(ConceptDataType.Coded.name())) {
            List<Object> values = (List<Object>) decision.getValue();
            List<Object> filteredValues = values
                    .stream()
                    .filter(conceptName -> checkConceptForRule(conceptName.toString(), ruleFailureLog))
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
