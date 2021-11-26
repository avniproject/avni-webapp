package org.avni.service;

import org.avni.dao.StandardReportCardTypeRepository;
import org.avni.domain.CHSEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.joda.time.DateTime;

@Service
public class StandardReportCardTypeService implements NonScopeAwareService {

    private final StandardReportCardTypeRepository standardReportCardTypeRepository;

    @Autowired
    public StandardReportCardTypeService(StandardReportCardTypeRepository standardReportCardTypeRepository) {
        this.standardReportCardTypeRepository = standardReportCardTypeRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return standardReportCardTypeRepository.existsByLastModifiedDateTimeGreaterThan(CHSEntity.toDate(lastModifiedDateTime));
    }
}
