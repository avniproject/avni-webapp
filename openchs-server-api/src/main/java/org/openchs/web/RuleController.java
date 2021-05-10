package org.openchs.web;

import org.codehaus.jettison.json.JSONException;
import org.openchs.dao.ProgramEnrolmentRepository;
import org.openchs.domain.ProgramEnrolment;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.service.RuleService;
import org.openchs.web.request.RuleDependencyRequest;
import org.openchs.web.request.RuleRequest;
import org.openchs.web.request.rules.request.RequestEntityWrapper;
import org.openchs.web.request.rules.response.RuleResponseEntity;
import org.openchs.web.validation.ValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
public class RuleController {
    private final Logger logger;
    private final RuleService ruleService;
    private final ProgramEnrolmentRepository programEnrolmentRepository;

    @Autowired
    public RuleController(RuleService ruleService, ProgramEnrolmentRepository programEnrolmentRepository) {
        this.programEnrolmentRepository = programEnrolmentRepository;
        logger = LoggerFactory.getLogger(this.getClass());
        this.ruleService = ruleService;
    }

    @RequestMapping(value = "/ruleDependency", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public ResponseEntity<?> saveDependency(@RequestBody RuleDependencyRequest ruleDependency) {
        logger.info(String.format("Creating rule dependency for: %s", UserContextHolder.getUserContext().getOrganisation().getName()));
        return new ResponseEntity<>(ruleService.createDependency(ruleDependency.getCode(), ruleDependency.getHash()).getUuid(),
                HttpStatus.CREATED);
    }

    @RequestMapping(value = "/rules", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public ResponseEntity<?> saveRules(@RequestBody List<RuleRequest> ruleRequests) {
        logger.info(String.format("Creating rules for: %s", UserContextHolder.getUserContext().getOrganisation().getName()));
        try {
            ruleService.createOrUpdate(ruleRequests);
        } catch (ValidationException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @RequestMapping(value = "/rule", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public ResponseEntity<?> saveRule(@RequestBody RuleRequest ruleRequest) {
        logger.info(String.format("Creating rules for: %s", UserContextHolder.getUserContext().getOrganisation().getName()));
        ruleService.createOrUpdate(ruleRequest);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @RequestMapping(value = "/web/rules", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'user')")
    ResponseEntity<?> executeServerSideRules(@RequestBody RequestEntityWrapper requestEntityWrapper) throws IOException, JSONException {
        RuleResponseEntity ruleResponseEntity = ruleService.executeServerSideRules(requestEntityWrapper);
        if (ruleResponseEntity.getStatus().equalsIgnoreCase("success")) {
            return ResponseEntity.ok().body(ruleResponseEntity);
        } else if (HttpStatus.NOT_FOUND.toString().equals(ruleResponseEntity.getStatus())) {
            return new ResponseEntity<>(ruleResponseEntity, HttpStatus.NOT_FOUND);
        } else {
            return ResponseEntity.badRequest().body(ruleResponseEntity);
        }
    }

    @RequestMapping(value = "/web/programSummaryRule", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'user')")
    ResponseEntity<?> programSummaryRule(@RequestParam String programEnrolmentUUID) {
        ProgramEnrolment programEnrolment = programEnrolmentRepository.findByUuid(programEnrolmentUUID);
        RuleResponseEntity ruleResponseEntity = ruleService.executeProgramSummaryRule(programEnrolment);
        if (ruleResponseEntity.getStatus().equalsIgnoreCase("success")) {
            return ResponseEntity.ok().body(ruleResponseEntity);
        } else if (HttpStatus.NOT_FOUND.toString().equals(ruleResponseEntity.getStatus())) {
            return new ResponseEntity<>(ruleResponseEntity, HttpStatus.NOT_FOUND);
        } else {
            return ResponseEntity.badRequest().body(ruleResponseEntity);
        }
    }
}
