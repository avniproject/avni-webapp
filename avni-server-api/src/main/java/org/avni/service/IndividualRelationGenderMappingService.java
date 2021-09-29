package org.avni.service;

import org.joda.time.DateTime;
import org.avni.dao.individualRelationship.IndividualRelationGenderMappingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class IndividualRelationGenderMappingService implements NonScopeAwareService {

    private final IndividualRelationGenderMappingRepository individualRelationGenderMappingRepository;

    @Autowired
    public IndividualRelationGenderMappingService(IndividualRelationGenderMappingRepository individualRelationGenderMappingRepository) {
        this.individualRelationGenderMappingRepository = individualRelationGenderMappingRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return individualRelationGenderMappingRepository.existsByAuditLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}
