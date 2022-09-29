package org.avni.server.web;

import org.avni.server.dao.EntityApprovalStatusRepository;
import org.avni.server.domain.CHSEntity;
import org.avni.server.domain.EntityApprovalStatus;
import org.avni.server.service.EntityApprovalStatusService;
import org.avni.server.web.request.EntityApprovalStatusRequest;
import org.joda.time.DateTime;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;

@RestController
public class EntityApprovalStatusController implements RestControllerResourceProcessor<EntityApprovalStatus> {
    private static org.slf4j.Logger logger = LoggerFactory.getLogger(IndividualController.class);
    private final EntityApprovalStatusService entityApprovalStatusService;
    private EntityApprovalStatusRepository entityApprovalStatusRepository;

    @Autowired
    public EntityApprovalStatusController(EntityApprovalStatusService entityApprovalStatusService, EntityApprovalStatusRepository entityApprovalStatusRepository) {
        this.entityApprovalStatusService = entityApprovalStatusService;
        this.entityApprovalStatusRepository = entityApprovalStatusRepository;
    }

    @RequestMapping(value = "/entityApprovalStatuses", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public void save(@RequestBody EntityApprovalStatusRequest request) {
        entityApprovalStatusService.save(request);
    }

    @RequestMapping(value = "/entityApprovalStatus", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<EntityApprovalStatus>> getEntityApprovals(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(entityApprovalStatusRepository.findByLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(CHSEntity.toDate(lastModifiedDateTime), CHSEntity.toDate(now), pageable));
    }

    @Override
    public Resource<EntityApprovalStatus> process(Resource<EntityApprovalStatus> resource) {
        EntityApprovalStatus entityApprovalStatus = resource.getContent();
        resource.removeLinks();
        resource.add(new Link(entityApprovalStatusService.getEntityUuid(entityApprovalStatus), "entityUUID"));
        resource.add(new Link(entityApprovalStatus.getApprovalStatus().getUuid(), "approvalStatusUUID"));
        return resource;
    }
}
