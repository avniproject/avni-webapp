package org.avni.server.web;

import org.avni.server.dao.RuleFailureTelemetryRepository;
import org.avni.server.domain.Organisation;
import org.avni.server.domain.RuleFailureTelemetry;
import org.avni.server.domain.User;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.web.request.RuleFailureTelemetryRequest;
import org.joda.time.DateTime;
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
import java.util.List;

@RestController
public class RuleFailureTelemetryController implements RestControllerResourceProcessor<RuleFailureTelemetry> {

    private final RuleFailureTelemetryRepository ruleFailureTelemetryRepository;

    @Autowired
    public RuleFailureTelemetryController(RuleFailureTelemetryRepository ruleFailureTelemetryRepository) {
        this.ruleFailureTelemetryRepository = ruleFailureTelemetryRepository;
    }

    // -------------------Sync APIS Start ----------------------------------------
    @RequestMapping(value = "ruleFailureTelemetry", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<RuleFailureTelemetry>> getEmpty(Pageable pageable) {
        return empty(pageable);
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
        ruleFailureTelemetry.setCreatedBy(user);
        ruleFailureTelemetry.setLastModifiedBy(user);
        ruleFailureTelemetry.setCreatedDateTime(DateTime.now());
        ruleFailureTelemetry.updateLastModifiedDateTime();
        ruleFailureTelemetry.setOrganisationId(organisation.getId());
        ruleFailureTelemetry.setErrorMessage(request.getErrorMessage());
        ruleFailureTelemetry.setIndividualUuid(request.getIndividualUuid());
        ruleFailureTelemetry.setStacktrace(request.getStacktrace());
        ruleFailureTelemetry.setRuleUuid(request.getRuleUuid());
        ruleFailureTelemetry.setErrorDateTime(request.getErrorDateTime());
        ruleFailureTelemetry.setClosed(request.getClosed());
        ruleFailureTelemetryRepository.save(ruleFailureTelemetry);
    }

    // -------------------Sync APIS End ----------------------------------------


    // -------------------Web APIS Start ----------------------------------------
    @RequestMapping(value = "/web/ruleFailureTelemetry", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<RuleFailureTelemetry>> getByStatus(@RequestParam(value = "isClosed", required = false) Boolean isClosed,
                                                  Pageable pageable) {
        Page<RuleFailureTelemetry> ruleFailureTelemetries = isClosed != null
                ? ruleFailureTelemetryRepository.findByIsClosed(isClosed, pageable)
                : ruleFailureTelemetryRepository.findAll(pageable);
        return wrap(ruleFailureTelemetries);
    }

    @RequestMapping(value = "/web/ruleFailureTelemetry", method = RequestMethod.PUT)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    public ResponseEntity<List<RuleFailureTelemetry>> updateStatus(@RequestParam("ids") List<Long> ids,
                                       @RequestParam(value = "isClosed") Boolean isClosed) {
        List<RuleFailureTelemetry> ruleFailureTelemetries = ruleFailureTelemetryRepository.findAllById(ids);
        ruleFailureTelemetries.forEach(ruleFailureTelemetry -> {
            ruleFailureTelemetry.setClosed(isClosed);
            ruleFailureTelemetry.setCloseDateTime(isClosed ? DateTime.now() : null);
        });
        ruleFailureTelemetryRepository.saveAll(ruleFailureTelemetries);
        return new ResponseEntity<>(ruleFailureTelemetries, HttpStatus.CREATED);
    }

    // -------------------Web APIS End ----------------------------------------
}
