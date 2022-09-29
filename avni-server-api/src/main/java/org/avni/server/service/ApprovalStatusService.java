package org.avni.server.service;

import org.avni.server.dao.ApprovalStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.joda.time.DateTime;

@Service
public class ApprovalStatusService implements NonScopeAwareService {

    private final ApprovalStatusRepository approvalStatusRepository;
    @Autowired
    public ApprovalStatusService(ApprovalStatusRepository approvalStatusRepository) {
        this.approvalStatusRepository = approvalStatusRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return approvalStatusRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}

