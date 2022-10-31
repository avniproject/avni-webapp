package org.avni.server.service;

import org.avni.server.dao.ChecklistItemDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.joda.time.DateTime;

@Service
public class ChecklistItemDetailService implements NonScopeAwareService {

    private final ChecklistItemDetailRepository checklistItemDetailRepository;

    @Autowired
    public ChecklistItemDetailService(ChecklistItemDetailRepository checklistItemDetailRepository) {
        this.checklistItemDetailRepository = checklistItemDetailRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return checklistItemDetailRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}
