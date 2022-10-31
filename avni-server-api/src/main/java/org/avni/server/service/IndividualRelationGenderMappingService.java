package org.avni.server.service;

import org.avni.server.dao.individualRelationship.IndividualRelationGenderMappingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.joda.time.DateTime;

@Service
public class IndividualRelationGenderMappingService implements NonScopeAwareService {

    private final IndividualRelationGenderMappingRepository individualRelationGenderMappingRepository;

    @Autowired
    public IndividualRelationGenderMappingService(IndividualRelationGenderMappingRepository individualRelationGenderMappingRepository) {
        this.individualRelationGenderMappingRepository = individualRelationGenderMappingRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return individualRelationGenderMappingRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}
