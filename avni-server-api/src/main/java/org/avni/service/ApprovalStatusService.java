package org.avni.service;

import org.joda.time.DateTime;
import org.avni.dao.ApprovalStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

