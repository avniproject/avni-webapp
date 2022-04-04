package org.avni.service;

import org.avni.dao.SyncParameters;
import org.joda.time.DateTime;
import org.avni.dao.OperatingIndividualScopeAwareRepository;
import org.avni.domain.*;
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

    public Page<T> getSyncResult(OperatingIndividualScopeAwareRepository<T> repository, User user, DateTime lastModifiedDateTime, DateTime now, Long typeId, Pageable pageable, SubjectType subjectType, SyncParameters.SyncEntityName syncEntityName) {
        List<Long> addressLevels = addressLevelService.getAllAddressLevelIdsForCatchment(user.getCatchment());
        return repository.getSyncResults(new SyncParameters(lastModifiedDateTime, now, typeId, pageable, addressLevels, subjectType, user.getSyncSettings(), syncEntityName));
    }
}
