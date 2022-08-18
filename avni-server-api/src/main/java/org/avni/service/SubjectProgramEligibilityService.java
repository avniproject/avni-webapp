package org.avni.service;

import org.avni.dao.OperatingIndividualScopeAwareRepository;
import org.avni.dao.SubjectTypeRepository;
import org.avni.dao.SyncParameters;
import org.avni.dao.program.SubjectProgramEligibilityRepository;
import org.avni.domain.SubjectType;
import org.avni.domain.User;
import org.avni.framework.security.UserContextHolder;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SubjectProgramEligibilityService implements ScopeAwareService {

    private final SubjectTypeRepository subjectTypeRepository;
    private final SubjectProgramEligibilityRepository subjectProgramEligibilityRepository;

    @Autowired
    public SubjectProgramEligibilityService(SubjectTypeRepository subjectTypeRepository,
                                            SubjectProgramEligibilityRepository subjectProgramEligibilityRepository) {
        this.subjectProgramEligibilityRepository = subjectProgramEligibilityRepository;
        this.subjectTypeRepository = subjectTypeRepository;
    }

    @Override
    public boolean isScopeEntityChanged(DateTime lastModifiedDateTime, String subjectTypeUUID) {
        SubjectType subjectType = subjectTypeRepository.findByUuid(subjectTypeUUID);
        User user = UserContextHolder.getUserContext().getUser();
        return subjectType != null && isChangedBySubjectTypeRegistrationLocationType(user, lastModifiedDateTime, subjectType.getId(), subjectType, SyncParameters.SyncEntityName.SubjectProgramEligibility);
    }

    @Override
    public OperatingIndividualScopeAwareRepository repository() {
        return subjectProgramEligibilityRepository;
    }
}
