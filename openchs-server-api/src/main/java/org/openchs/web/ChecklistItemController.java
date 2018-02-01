package org.openchs.web;

import org.openchs.dao.ChecklistItemRepository;
import org.openchs.dao.ChecklistRepository;
import org.openchs.dao.ConceptRepository;
import org.openchs.domain.Checklist;
import org.openchs.domain.ChecklistItem;
import org.openchs.util.LockProvider;
import org.openchs.web.request.application.ChecklistItemRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;

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

    @PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
    @RequestMapping(value = "/checklistItems", method = RequestMethod.POST)
    public void save(@RequestBody ChecklistItemRequest checklistItemRequest) {
        synchronized (LockProvider.getLockObject(this)) {
            saveInternal(checklistItemRequest);
        }
    }

    @Transactional
    void saveInternal(ChecklistItemRequest checklistItemRequest) {
        ChecklistItem checklistItem = newOrExistingEntity(checklistItemRepository, checklistItemRequest, new ChecklistItem());
        checklistItem.setConcept(conceptRepository.findByUuid(checklistItemRequest.getConceptUUID()));
        checklistItem.setCompletionDate(checklistItemRequest.getCompletionDate());
        checklistItem.setDueDate(checklistItemRequest.getDueDate());
        checklistItem.setMaxDate(checklistItemRequest.getMaxDate());

        if (checklistItem.isNew()) {
            Checklist checklist = checklistRepository.findByUuid(checklistItemRequest.getChecklistUUID());
            checklistItem.setChecklist(checklist);
            checklist.addItem(checklistItem);
            checklistRepository.save(checklist);
        } else {
            checklistItemRepository.save(checklistItem);
        }
    }
}