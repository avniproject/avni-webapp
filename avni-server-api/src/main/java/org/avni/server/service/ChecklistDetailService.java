package org.avni.server.service;

import org.avni.server.builder.ChecklistDetailBuilder;
import org.avni.server.dao.ChecklistDetailRepository;
import org.avni.server.dao.ChecklistItemDetailRepository;
import org.avni.server.domain.ChecklistDetail;
import org.avni.server.domain.ChecklistItemDetail;
import org.avni.server.web.request.CHSRequest;
import org.avni.server.web.request.application.ChecklistDetailRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.joda.time.DateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChecklistDetailService implements NonScopeAwareService {

    private static Logger logger = LoggerFactory.getLogger(ChecklistDetailService.class);
    private final ChecklistDetailRepository checklistDetailRepository;
    private final ChecklistItemDetailRepository checklistItemDetailRepository;

    @Autowired
    public ChecklistDetailService(ChecklistDetailRepository checklistDetailRepository, ChecklistItemDetailRepository checklistItemDetailRepository) {
        this.checklistDetailRepository = checklistDetailRepository;
        this.checklistItemDetailRepository = checklistItemDetailRepository;
    }

    public void saveChecklist(ChecklistDetailRequest checklistDetail) {
        if (checklistDetail.getItems() == null) {
            throw new IllegalArgumentException("No checklist item found in the request");
        }
        logger.info(String.format("Saving checklist detail: %s, with UUID: %s", checklistDetail.getName(), checklistDetail.getUuid()));
        List<ChecklistDetail> checklists = checklistDetailRepository.findAll();
        ChecklistDetail checklist = null;
        if (!checklists.isEmpty()) {
            checklist = checklists.get(0);
        }
        checklist = new ChecklistDetailBuilder(checklist)
                .withItems(checklistDetail.getItems())
                .withName(checklistDetail.getName())
                .withUUID(checklist == null ? checklistDetail.getUuid() : checklist.getUuid())
                .withVoided(checklistDetail.isVoided())
                .build();
        checklist.updateLastModifiedDateTime();
        List<String> checklistItemDetailsUUIDs = checklistDetail.getItems().stream().map(CHSRequest::getUuid).collect(Collectors.toList());
        voidUnusedItems(checklist.getItems(), checklistItemDetailsUUIDs);
        checklistDetailRepository.save(checklist);
    }


    public List<ChecklistDetailRequest> getAllChecklistDetail() {
        return checklistDetailRepository.findAll()
                .stream()
                .map(ChecklistDetailRequest::fromEntity)
                .collect(Collectors.toList());
    }

    private void voidUnusedItems(List<ChecklistItemDetail> checklistItemDetails, List<String> newChecklistDetailsUUIDs) {
        List<ChecklistItemDetail> unusedChecklistItemDetails = checklistItemDetails.stream()
                .filter(cid -> !newChecklistDetailsUUIDs.contains(cid.getUuid()))
                .peek(cid -> cid.setVoided(true)).collect(Collectors.toList());
        checklistItemDetailRepository.saveAll(unusedChecklistItemDetails);
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return checklistDetailRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }

    public List<ChecklistDetail> getAll() {
        return checklistDetailRepository.findAllByIsVoidedFalse();
    }
}
