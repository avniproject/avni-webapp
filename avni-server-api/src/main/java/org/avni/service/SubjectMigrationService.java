package org.avni.service;

import org.avni.dao.*;
import org.avni.domain.SubjectType;
import org.avni.domain.User;
import org.avni.framework.security.UserContextHolder;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SubjectMigrationService implements ScopeAwareService {

    private SubjectMigrationRepository subjectMigrationRepository;
    private SubjectTypeRepository subjectTypeRepository;

    @Autowired
    public SubjectMigrationService(SubjectMigrationRepository subjectMigrationRepository, SubjectTypeRepository subjectTypeRepository) {
        this.subjectMigrationRepository = subjectMigrationRepository;
        this.subjectTypeRepository = subjectTypeRepository;
    }

    @Override
    public OperatingIndividualScopeAwareRepository repository() {
        return subjectMigrationRepository;
    }

    @Override
    public boolean isScopeEntityChanged(DateTime lastModifiedDateTime, String subjectTypeUUID) {
        SubjectType subjectType = subjectTypeRepository.findByUuid(subjectTypeUUID);
        User user = UserContextHolder.getUserContext().getUser();
        return subjectType != null && isChanged(user, lastModifiedDateTime, subjectType.getId());
    }
}

