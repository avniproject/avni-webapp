package org.openchs.web;

import org.openchs.dao.RuleFailureTelemetryRepository;
import org.openchs.domain.Organisation;
import org.openchs.domain.RuleFailureTelemetry;
import org.openchs.domain.Status;
import org.openchs.domain.User;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.web.request.RuleFailureTelemetryRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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

    @RequestMapping(value = "/web/ruleFailureTelemetry", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public Page<RuleFailureTelemetry> getByStatus(@RequestParam(value = "isClosed") Boolean isClosed,
                                                  Pageable pageable) {
        return ruleFailureTelemetryRepository.findByIsClosed(isClosed, pageable);
    }

    @RequestMapping(value = "/web/ruleFailureTelemetry/{id}", method = RequestMethod.PUT)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    public ResponseEntity updateStatus(@PathVariable("id") Long id,
                                       @RequestParam(value = "isClosed") Boolean isClosed) {
        RuleFailureTelemetry ruleFailureTelemetry = ruleFailureTelemetryRepository.findOne(id);
        if (ruleFailureTelemetry == null) {
            return ResponseEntity.badRequest().body(String.format("No entry found with id %d", id));
        }
        ruleFailureTelemetry.setClosed(isClosed);
        ruleFailureTelemetryRepository.save(ruleFailureTelemetry);
        return new ResponseEntity<>(ruleFailureTelemetry, HttpStatus.CREATED);
    }


    @RequestMapping(value = "/ruleFailureTelemetry", method = RequestMethod.POST)
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
        ruleFailureTelemetry.setErrorDateTime(request.getErrorDateTime());
        ruleFailureTelemetry.setClosed(request.getClosed());
        ruleFailureTelemetryRepository.save(ruleFailureTelemetry);
    }

}
