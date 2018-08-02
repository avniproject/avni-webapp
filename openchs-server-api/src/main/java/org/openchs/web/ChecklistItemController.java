package org.openchs.web;

import org.openchs.dao.ChecklistItemDetailRepository;
import org.openchs.dao.ChecklistItemRepository;
import org.openchs.dao.ChecklistRepository;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.application.FormRepository;
import org.openchs.domain.Checklist;
import org.openchs.domain.ChecklistItem;
import org.openchs.domain.ChecklistItemStatus;
import org.openchs.service.ObservationService;
import org.openchs.web.request.application.ChecklistItemRequest;
import org.openchs.web.request.application.ChecklistItemStatusRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class ChecklistItemController extends AbstractController<ChecklistItem> {
    private final ObservationService observationService;
    private final ChecklistItemDetailRepository checklistItemDetailRepository;
    private ChecklistRepository checklistRepository;
    private ChecklistItemRepository checklistItemRepository;

    @Autowired
    public ChecklistItemController(ChecklistRepository checklistRepository, ChecklistItemRepository checklistItemRepository, ObservationService observationService, ChecklistItemDetailRepository checklistItemDetailRepository) {
        this.checklistRepository = checklistRepository;
        this.checklistItemRepository = checklistItemRepository;
        this.observationService = observationService;
        this.checklistItemDetailRepository = checklistItemDetailRepository;
    }

    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
    @RequestMapping(value = "/checklistItems", method = RequestMethod.POST)
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
}