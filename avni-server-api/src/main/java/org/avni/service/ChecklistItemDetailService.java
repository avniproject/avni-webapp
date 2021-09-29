package org.avni.service;

import org.joda.time.DateTime;
import org.avni.dao.ChecklistItemDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChecklistItemDetailService implements NonScopeAwareService {

    private final ChecklistItemDetailRepository checklistItemDetailRepository;

    @Autowired
    public ChecklistItemDetailService(ChecklistItemDetailRepository checklistItemDetailRepository) {
        this.checklistItemDetailRepository = checklistItemDetailRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return checklistItemDetailRepository.existsByAuditLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}
