package org.openchs.service;

import org.openchs.builder.ChecklistDetailBuilder;
import org.openchs.dao.ChecklistDetailRepository;
import org.openchs.domain.ChecklistDetail;
import org.openchs.web.request.application.ChecklistDetailRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChecklistDetailService {

    private static Logger logger = LoggerFactory.getLogger(ChecklistDetailService.class);
    private final ChecklistDetailRepository checklistDetailRepository;

    @Autowired
    public ChecklistDetailService(ChecklistDetailRepository checklistDetailRepository) {
        this.checklistDetailRepository = checklistDetailRepository;
    }

    public void saveChecklist(ChecklistDetailRequest checklistDetail) {
        if (checklistDetail.getItems() == null) {
            throw new IllegalArgumentException("No checklist item found in the request");
        }
        logger.info(String.format("Saving checklist detail: %s, with UUID: %s", checklistDetail.getName(), checklistDetail.getUuid()));
        ChecklistDetail checklist = checklistDetailRepository.findByUuid(checklistDetail.getUuid());
        checklist = new ChecklistDetailBuilder(checklist)
                .withItems(checklistDetail.getItems())
                .withName(checklistDetail.getName())
                .withUUID(checklistDetail.getUuid())
                .withVoided(checklistDetail.isVoided())
                .build();
        checklist.updateLastModifiedDateTime();
        checklistDetailRepository.save(checklist);
    }


    public List<ChecklistDetailRequest> getAllChecklistDetail() {
        return checklistDetailRepository.findAllByIsVoidedFalse()
                .stream()
                .map(ChecklistDetailRequest::fromEntity)
                .collect(Collectors.toList());
    }
}
