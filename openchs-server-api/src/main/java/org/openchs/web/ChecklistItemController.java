package org.openchs.web;

import org.openchs.dao.ChecklistItemRepository;
import org.openchs.dao.ChecklistRepository;
import org.openchs.dao.ConceptRepository;
import org.openchs.domain.Checklist;
import org.openchs.domain.ChecklistItem;
import org.openchs.domain.ChecklistItemStatus;
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
    private ChecklistRepository checklistRepository;
    private ChecklistItemRepository checklistItemRepository;
    private ConceptRepository conceptRepository;

    @Autowired
    public ChecklistItemController(ChecklistRepository checklistRepository, ChecklistItemRepository checklistItemRepository, ConceptRepository conceptRepository) {
        this.checklistRepository = checklistRepository;
        this.checklistItemRepository = checklistItemRepository;
        this.conceptRepository = conceptRepository;
    }

    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
    @RequestMapping(value = "/checklistItems", method = RequestMethod.POST)
    public void save(@RequestBody ChecklistItemRequest checklistItemRequest) {
        ChecklistItem checklistItem = newOrExistingEntity(checklistItemRepository, checklistItemRequest, new ChecklistItem());
        checklistItem.setConcept(conceptRepository.findByUuid(checklistItemRequest.getConceptUUID()));
        checklistItem.setCompletionDate(checklistItemRequest.getCompletionDate());
        checklistItem.setChecklistItemStatus(this.makeStatus(checklistItemRequest.getStatus()));

        if (checklistItem.isNew()) {
            Checklist checklist = checklistRepository.findByUuid(checklistItemRequest.getChecklistUUID());
            checklistItem.setChecklist(checklist);
            checklist.addItem(checklistItem);
            checklistRepository.save(checklist);
        } else {
            checklistItemRepository.save(checklistItem);
        }
    }

    private ChecklistItemStatus makeStatus(List<ChecklistItemStatusRequest> states) {
        ChecklistItemStatus checklistItemStatus = new ChecklistItemStatus();
        states.forEach((state) -> {
            Map<String, Object> dbState = new HashMap<>();
            dbState.put("uuid", state.getUuid());
            dbState.put("state", state.getState());
            dbState.put("color", state.getColor());
            dbState.put("from", state.getFrom());
            dbState.put("to", state.getTo());
            checklistItemStatus.add(dbState);
        });
        return checklistItemStatus;
    }
}