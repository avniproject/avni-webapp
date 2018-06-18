package org.openchs.service;

import org.openchs.application.RuleType;
import org.openchs.dao.RuleDependencyRepository;
import org.openchs.dao.RuleRepository;
import org.openchs.dao.application.FormRepository;
import org.openchs.domain.Rule;
import org.openchs.domain.RuleData;
import org.openchs.domain.RuleDependency;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.web.request.RuleRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.transaction.Transactional;

@Service
public class RuleService {

    private final RuleDependencyRepository ruleDependencyRepository;
    private final RuleRepository ruleRepository;
    private final FormRepository formRepository;

    @Autowired
    public RuleService(RuleDependencyRepository ruleDependencyRepository, RuleRepository ruleRepository, FormRepository formRepository) {
        this.ruleDependencyRepository = ruleDependencyRepository;
        this.ruleRepository = ruleRepository;
        this.formRepository = formRepository;
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
        return ruleDependencyRepository.save(ruleDependency);
    }

    @Transactional
    public Rule createRule(String ruleDependencyUUID, RuleRequest rule) {
        RuleDependency ruleDependency = ruleDependencyRepository.findByUuid(ruleDependencyUUID);
        Rule existingRule = ruleRepository.findByUuid(rule.getUuid());
        if (existingRule == null) existingRule = new Rule();
        existingRule.setUuid(rule.getUuid());
        existingRule.setData(new RuleData(rule.getData()));
        existingRule.setForm(formRepository.findByUuid(rule.getFormUUID()));
        existingRule.setName(rule.getName());
        existingRule.setFnName(rule.getFnName());
        existingRule.setType(RuleType.valueOf(StringUtils.capitalize(rule.getType())));
        existingRule.setRuleDependency(ruleDependency);
        return ruleRepository.save(existingRule);
    }
}
