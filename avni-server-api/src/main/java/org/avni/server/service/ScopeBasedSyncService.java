package org.avni.server.service;

import org.avni.server.dao.SyncParameters;
import org.avni.server.domain.CHSEntity;
import org.avni.server.domain.SubjectType;
import org.avni.server.domain.User;
import org.joda.time.DateTime;
import org.avni.server.dao.OperatingIndividualScopeAwareRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScopeBasedSyncService<T extends CHSEntity> {
    private AddressLevelService addressLevelService;

    public ScopeBasedSyncService(AddressLevelService addressLevelService) {
        this.addressLevelService = addressLevelService;
    }

    public Page<T> getSyncResultsBySubjectTypeRegistrationLocation(OperatingIndividualScopeAwareRepository<T> repository, User user, DateTime lastModifiedDateTime, DateTime now, Long typeId, Pageable pageable, SubjectType subjectType, SyncParameters.SyncEntityName syncEntityName) {
        List<Long> addressLevels = addressLevelService.getAllRegistrationAddressIdsBySubjectType(user.getCatchment(), subjectType);
        return repository.getSyncResults(new SyncParameters(lastModifiedDateTime, now, typeId, pageable, addressLevels, subjectType, user.getSyncSettings(), syncEntityName, user.getCatchment()));
    }

    public Page<T> getSyncResultsByCatchment(OperatingIndividualScopeAwareRepository<T> repository, User user, DateTime lastModifiedDateTime, DateTime now, Pageable pageable, SyncParameters.SyncEntityName syncEntityName) {
        return repository.getSyncResults(new SyncParameters(lastModifiedDateTime, now, null, pageable, null, null, user.getSyncSettings(), syncEntityName, user.getCatchment()));
    }
}
