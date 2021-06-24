package org.openchs.web;

import org.openchs.service.EntityApprovalStatusService;
import org.openchs.web.request.EntityApprovalStatusRequest;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;

@RestController
public class EntityApprovalStatusController {
    private static org.slf4j.Logger logger = LoggerFactory.getLogger(IndividualController.class);
    private final EntityApprovalStatusService entityApprovalStatusService;

    @Autowired
    public EntityApprovalStatusController(EntityApprovalStatusService entityApprovalStatusService) {
        this.entityApprovalStatusService = entityApprovalStatusService;
    }

    @RequestMapping(value = "/entityApprovalStatuses", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public void save(@RequestBody EntityApprovalStatusRequest request) {
        entityApprovalStatusService.save(request);
    }
}
