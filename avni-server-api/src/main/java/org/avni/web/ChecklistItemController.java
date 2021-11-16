package org.avni.web;

import org.avni.dao.ChecklistDetailRepository;
import org.avni.dao.ChecklistItemDetailRepository;
import org.avni.dao.ChecklistItemRepository;
import org.avni.dao.ChecklistRepository;
import org.avni.domain.Checklist;
import org.avni.domain.ChecklistDetail;
import org.avni.domain.ChecklistItem;
import org.avni.service.ObservationService;
import org.avni.service.ScopeBasedSyncService;
import org.avni.service.UserService;
import org.avni.web.request.application.ChecklistItemRequest;
import org.joda.time.DateTime;
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

@RestController
public class ChecklistItemController extends AbstractController<ChecklistItem> implements RestControllerResourceProcessor<ChecklistItem> {
    private final ObservationService observationService;
    private final ChecklistItemDetailRepository checklistItemDetailRepository;
    private final ChecklistRepository checklistRepository;
    private final ChecklistItemRepository checklistItemRepository;
    private final ChecklistDetailRepository checklistDetailRepository;
    private final UserService userService;
    private ScopeBasedSyncService<ChecklistItem> scopeBasedSyncService;

    @Autowired
    public ChecklistItemController(ChecklistRepository checklistRepository, ChecklistItemRepository checklistItemRepository, ObservationService observationService, ChecklistItemDetailRepository checklistItemDetailRepository, ChecklistDetailRepository checklistDetailRepository, UserService userService, ScopeBasedSyncService<ChecklistItem> scopeBasedSyncService) {
        this.checklistRepository = checklistRepository;
        this.checklistItemRepository = checklistItemRepository;
        this.observationService = observationService;
        this.checklistItemDetailRepository = checklistItemDetailRepository;
        this.checklistDetailRepository = checklistDetailRepository;
        this.userService = userService;
        this.scopeBasedSyncService = scopeBasedSyncService;
    }

    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @RequestMapping(value = "/checklistItems", method = RequestMethod.POST)
    public void saveOld(@RequestBody Object object) {
    }

    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('user')")
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
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<ChecklistItem>> getByIndividualsOfCatchmentAndLastModified(
            @RequestParam("catchmentId") long catchmentId,
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(checklistItemRepository.findByChecklistProgramEnrolmentIndividualAddressLevelVirtualCatchmentsIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(catchmentId, lastModifiedDateTime, now, pageable));
    }


    @RequestMapping(value = "/txNewChecklistItemEntity", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<ChecklistItem>> getChecklistItemsByOperatingIndividualScope(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            @RequestParam(value = "checklistDetailUuid", required = false) String checklistDetailUuid,
            Pageable pageable) {
        if (checklistDetailUuid.isEmpty()) return wrap(new PageImpl<>(Collections.emptyList()));
        ChecklistDetail checklistDetail = checklistDetailRepository.findByUuid(checklistDetailUuid);
        if (checklistDetail == null) return wrap(new PageImpl<>(Collections.emptyList()));
        return wrap(scopeBasedSyncService.getSyncResult(checklistItemRepository, userService.getCurrentUser(), lastModifiedDateTime, now, checklistDetail.getId(), pageable));
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

}
