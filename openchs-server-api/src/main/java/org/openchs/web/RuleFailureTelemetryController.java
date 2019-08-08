package org.openchs.web;

import org.openchs.dao.RuleFailureTelemetryRepository;
import org.openchs.domain.Organisation;
import org.openchs.domain.RuleFailureTelemetry;
import org.openchs.domain.User;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.web.request.RuleFailureTelemetryRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;

@RestController
public class RuleFailureTelemetryController implements RestControllerResourceProcessor<RuleFailureTelemetry> {

    private final RuleFailureTelemetryRepository ruleFailureTelemetryRepository;

    @Autowired
    public RuleFailureTelemetryController(RuleFailureTelemetryRepository ruleFailureTelemetryRepository) {
        this.ruleFailureTelemetryRepository = ruleFailureTelemetryRepository;
    }

    @RequestMapping(value = "ruleFailureTelemetry", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<RuleFailureTelemetry>> getEmpty(Pageable pageable) {
        return empty(pageable);
    }


    @RequestMapping(value = "ruleFailureTelemetry", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public void save(@RequestBody RuleFailureTelemetryRequest request) {
        User user = UserContextHolder.getUserContext().getUser();
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        RuleFailureTelemetry ruleFailureTelemetry = new RuleFailureTelemetry();
        ruleFailureTelemetry.setUuid(request.getUuid());
        ruleFailureTelemetry.setUser(user);
        ruleFailureTelemetry.setOrganisationId(organisation.getId());
        ruleFailureTelemetry.setErrorMessage(request.getErrorMessage());
        ruleFailureTelemetry.setIndividualUuid(request.getIndividualUuid());
        ruleFailureTelemetry.setStacktrace(request.getStacktrace());
        ruleFailureTelemetry.setRuleUuid(request.getRuleUuid());
        ruleFailureTelemetry.setStatus(request.getStatus());
        ruleFailureTelemetryRepository.save(ruleFailureTelemetry);
    }

}
