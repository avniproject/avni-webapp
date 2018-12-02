package org.openchs.service;

import org.openchs.application.Form;
import org.openchs.application.RuleType;
import org.openchs.application.RuleableEntity;
import org.openchs.dao.OperationalProgramRepository;
import org.openchs.dao.RuleDependencyRepository;
import org.openchs.dao.RuleRepository;
import org.openchs.dao.application.FormRepository;
import org.openchs.domain.OperationalProgram;
import org.openchs.domain.Rule;
import org.openchs.domain.RuleData;
import org.openchs.domain.RuleDependency;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.web.request.RuleRequest;
import org.openchs.web.validation.ValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RuleService {
    private final Logger logger;
    private final RuleDependencyRepository ruleDependencyRepository;
    private final RuleRepository ruleRepository;
    private final FormRepository formRepository;
    private final OperationalProgramRepository operationalProgramRepository;

    @Autowired
    public RuleService(RuleDependencyRepository ruleDependencyRepository,
                       RuleRepository ruleRepository,
                       FormRepository formRepository,
                       OperationalProgramRepository operationalProgramRepository)
    {
        logger = LoggerFactory.getLogger(this.getClass());
        this.ruleDependencyRepository = ruleDependencyRepository;
        this.ruleRepository = ruleRepository;
        this.formRepository = formRepository;
        this.operationalProgramRepository = operationalProgramRepository;
    }

    @Transactional
    public RuleDependency createDependency(String ruleCode, String ruleHash) {
        RuleDependency ruleDependency = ruleDependencyRepository
                .findByOrganisationId(UserContextHolder.getUserContext().getOrganisation().getId());
        if (ruleDependency == null) ruleDependency = new RuleDependency();
        if (ruleHash.equals(ruleDependency.getChecksum())) return ruleDependency;
        ruleDependency.setCode(ruleCode);
        ruleDependency.setChecksum(ruleHash);
        ruleDependency.assignUUIDIfRequired();
        logger.info(String.format("Rule dependency with UUID: %s", ruleDependency.getUuid()));
        return ruleDependencyRepository.save(ruleDependency);
    }

    private Rule _setCommonAttributes(Rule rule, RuleRequest ruleRequest) {
        rule.setUuid(ruleRequest.getUuid());
        rule.setData(new RuleData(ruleRequest.getData()));
        rule.setName(ruleRequest.getName());
        rule.setFnName(ruleRequest.getFnName());
        rule.setType(RuleType.valueOf(StringUtils.capitalize(ruleRequest.getType())));
        rule.setExecutionOrder(ruleRequest.getExecutionOrder());
        rule.setVoided(false);
        return rule;
    }

    private Rule _setVaryingAttributes(Rule rule, RuleRequest ruleRequest) {
        if (StringUtils.capitalize(ruleRequest.getEntityType()).equals(RuleableEntity.Form.name())) {
            Form form = formRepository.findByUuid(ruleRequest.getFormUUID());
            if (form == null) {
                throw new ValidationException(String.format("Form with uuid: %s not found for rule with uuid: %s", ruleRequest.getFormUUID(), ruleRequest.getUuid()));
            }
            rule.setForm(form);
        }
        else if (StringUtils.capitalize(ruleRequest.getEntityType()).equals(RuleableEntity.OperationalProgram.name())) {
            OperationalProgram opProgram = operationalProgramRepository.findByUuid(ruleRequest.getEntityUUID());
            if (opProgram == null) {
                throw new ValidationException(String.format("OperationalProgram with uuid: %s not found for rule with uuid: %s", ruleRequest.getEntityUUID(), ruleRequest.getUuid()));
            }
            rule.setOperationalProgram(opProgram);
        }
        return rule;
    }

    @Transactional
    public Rule createRule(String ruleDependencyUUID, RuleRequest ruleRequest) {
        RuleDependency ruleDependency = ruleDependencyRepository.findByUuid(ruleDependencyUUID);
        Rule rule = ruleRepository.findByUuid(ruleRequest.getUuid());
        if (rule == null) rule = new Rule();
        rule.setRuleDependency(ruleDependency);
        rule = this._setCommonAttributes(rule, ruleRequest);
        rule = this._setVaryingAttributes(rule, ruleRequest);
        if (rule.getForm() != null)
            logger.info(String.format("Creating Rule with UUID '%s', Name '%s', Type '%s', Form '%s'", rule.getUuid(), rule.getName(), rule.getType(), rule.getForm().getName()));
        else
            logger.info(String.format("Creating Rule with UUID '%s', Name '%s', Type '%s', OperationalProgram '%s'", rule.getUuid(), rule.getName(), rule.getType(), rule.getOperationalProgram().getName()));
        return ruleRepository.save(rule);
    }

    @Transactional
    public List<Rule> createRules(List<RuleRequest> rules) {
        List<Rule> allRules = ruleRepository.findByOrganisationId(UserContextHolder.getUserContext().getOrganisation().getId());
        List<Rule> createdRules = rules.stream().map(ruleRequest -> createRule(ruleRequest.getRuleDependencyUUID(), ruleRequest))
                .collect(Collectors.toList());
        List<String> ruleUUIDs = createdRules.stream().map(Rule::getUuid).collect(Collectors.toList());
        List<Rule> voidedRules = allRules.stream()
                .filter(r -> !ruleUUIDs.contains(r.getUuid()))
                .collect(Collectors.toList());
        voidedRules.stream().peek(vr -> vr.setVoided(true)).forEach(ruleRepository::save);
        return allRules;
    }
}
