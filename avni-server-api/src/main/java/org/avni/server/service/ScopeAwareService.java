package org.avni.server.service;

import org.avni.server.dao.OperatingIndividualScopeAwareRepository;
import org.avni.server.dao.SyncParameters;
import org.avni.server.domain.CHSEntity;
import org.avni.server.domain.SubjectType;
import org.avni.server.domain.User;
import org.avni.server.framework.ApplicationContextProvider;
import org.joda.time.DateTime;

import java.util.List;

public interface ScopeAwareService<T extends CHSEntity> {

    default boolean isChangedBySubjectTypeRegistrationLocationType(User user, DateTime lastModifiedDateTime, Long typeId, SubjectType subjectType, SyncParameters.SyncEntityName syncEntityName) {
        AddressLevelService addressLevelService = ApplicationContextProvider.getContext().getBean(AddressLevelService.class);
        List<Long> addressIds = addressLevelService.getAllRegistrationAddressIdsBySubjectType(user.getCatchment(), subjectType);
        return repository().isEntityChangedForCatchment(new SyncParameters(lastModifiedDateTime, null, typeId, null, addressIds, subjectType, user.getSyncSettings(), syncEntityName, user.getCatchment()));
    }

    default boolean isChangedByCatchment(User user, DateTime lastModifiedDateTime, SyncParameters.SyncEntityName syncEntityName) {
        return repository().isEntityChangedForCatchment(new SyncParameters(lastModifiedDateTime, null, null, null, null, null, user.getSyncSettings(), syncEntityName, user.getCatchment()));
    }

    OperatingIndividualScopeAwareRepository<T> repository();

    boolean isScopeEntityChanged(DateTime lastModifiedDateTime, String typeUUID);
}
