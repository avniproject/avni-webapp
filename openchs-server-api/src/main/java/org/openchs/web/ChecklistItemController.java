package org.openchs.web;

import org.joda.time.DateTime;
import org.openchs.dao.*;
import org.openchs.domain.Checklist;
import org.openchs.domain.ChecklistItem;
import org.openchs.service.ObservationService;
import org.openchs.service.UserService;
import org.openchs.web.request.application.ChecklistItemRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.Collections;
import java.util.List;

@RestController
public class ChecklistItemController extends AbstractController<ChecklistItem> implements RestControllerResourceProcessor<ChecklistItem>, OperatingIndividualScopeAwareController<ChecklistItem>, OperatingIndividualScopeAwareFilterController<ChecklistItem> {
    private final ObservationService observationService;
    private final ChecklistItemDetailRepository checklistItemDetailRepository;
    private final ChecklistRepository checklistRepository;
    private final ChecklistItemRepository checklistItemRepository;
    private final UserService userService;

    @Autowired
    public ChecklistItemController(ChecklistRepository checklistRepository, ChecklistItemRepository checklistItemRepository, ObservationService observationService, ChecklistItemDetailRepository checklistItemDetailRepository, UserService userService) {
        this.checklistRepository = checklistRepository;
        this.checklistItemRepository = checklistItemRepository;
        this.observationService = observationService;
        this.checklistItemDetailRepository = checklistItemDetailRepository;
        this.userService = userService;
    }

    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @RequestMapping(value = "/checklistItems", method = RequestMethod.POST)
    public void saveOld(@RequestBody Object object) {
    }

    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    @RequestMapping(value = "/txNewChecklistItemEntitys", method = RequestMethod.POST)
    public void save(@RequestBody ChecklistItemRequest checklistItemRequest) {
        ChecklistItem checklistItem = newOrExistingEntity(checklistItemRepository, checklistItemRequest, new ChecklistItem());

        checklistItem.setCompletionDate(checklistItemRequest.getCompletionDate());

        checklistItem.setObservations(this.observationService.createObservations(checklistItemRequest.getObservations()));
        if (checklistItem.isNew()) {
            Checklist checklist = checklistRepository.findByUuid(checklistItemRequest.getChecklistUUID());
            checklistItem.setChecklist(checklist);
            checklistItem.setChecklistItemDetail(checklistItemDetailRepository.findByUuid(checklistItemRequest.getChecklistItemDetailUUID()));
        }
        checklistItemRepository.save(checklistItem);
    }

    @RequestMapping(value = "/txNewChecklistItemEntity/search/byIndividualsOfCatchmentAndLastModified", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public PagedResources<Resource<ChecklistItem>> getByIndividualsOfCatchmentAndLastModified(
            @RequestParam("catchmentId") long catchmentId,
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(checklistItemRepository.findByChecklistProgramEnrolmentIndividualAddressLevelVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(catchmentId, lastModifiedDateTime, now, pageable));
    }


    @RequestMapping(value = "/txNewChecklistItemEntity", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public PagedResources<Resource<ChecklistItem>> getChecklistItemsByOperatingIndividualScope(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            @RequestParam(value = "checklistDetailUuid", required = false) String checklistDetailUuid,
            Pageable pageable) {
        if (checklistDetailUuid == null) {
            return wrap(getCHSEntitiesForUserByLastModifiedDateTime(userService.getCurrentUser(), lastModifiedDateTime, now, pageable));
        } else {
            return checklistDetailUuid.isEmpty() ? wrap(new PageImpl<>(Collections.emptyList())) :
                    wrap(getCHSEntitiesForUserByLastModifiedDateTimeAndFilterByType(userService.getCurrentUser(), lastModifiedDateTime, now, checklistDetailUuid, pageable));
        }
    }

    @Override
    public Resource<ChecklistItem> process(Resource<ChecklistItem> resource) {
        ChecklistItem checklistItem = resource.getContent();
        resource.removeLinks();
        resource.add(new Link(checklistItem.getChecklist().getUuid(), "checklistUUID"));
        if (checklistItem.getChecklistItemDetail() != null) {
            resource.add(new Link(checklistItem.getChecklistItemDetail().getUuid(), "checklistItemDetailUUID"));
        }
        return resource;
    }

    @Override
    public OperatingIndividualScopeAwareRepository<ChecklistItem> resourceRepository() {
        return checklistItemRepository;
    }

    @Override
    public OperatingIndividualScopeAwareRepositoryWithTypeFilter<ChecklistItem> repository() {
        return checklistItemRepository;
    }
}