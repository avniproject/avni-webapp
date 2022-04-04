package org.avni.service;

import org.avni.dao.OperatingIndividualScopeAwareRepository;
import org.avni.dao.SyncParameters;
import org.avni.domain.*;
import org.avni.framework.ApplicationContextProvider;
import org.joda.time.DateTime;

import java.util.List;

public interface ScopeAwareService<T extends CHSEntity> {

    default boolean isChanged(User user, DateTime lastModifiedDateTime, Long typeId, SubjectType subjectType, SyncParameters.SyncEntityName syncEntityName) {
        AddressLevelService addressLevelService = ApplicationContextProvider.getContext().getBean(AddressLevelService.class);
        List<Long> addressIds = addressLevelService.getAllAddressLevelIdsForCatchment(user.getCatchment());
        return repository().isEntityChangedForCatchment(new SyncParameters(lastModifiedDateTime, null, typeId, null, addressIds, subjectType, user.getSyncSettings(), syncEntityName));
    }

    OperatingIndividualScopeAwareRepository<T> repository();

    boolean isScopeEntityChanged(DateTime lastModifiedDateTime, String typeUUID);
}
