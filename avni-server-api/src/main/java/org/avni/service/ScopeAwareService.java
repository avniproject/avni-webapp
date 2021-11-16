package org.avni.service;

import org.avni.dao.OperatingIndividualScopeAwareRepository;
import org.avni.domain.*;
import org.avni.framework.ApplicationContextProvider;
import org.joda.time.DateTime;

import org.joda.time.DateTime;
import java.util.List;

import static org.avni.domain.OperatingIndividualScope.ByCatchment;
import static org.avni.domain.OperatingIndividualScope.ByFacility;

public interface ScopeAwareService<T extends CHSEntity> {

    default boolean isChanged(User user, DateTime lastModifiedDateTime, Long typeId) {
        OperatingIndividualScope scope = user.getOperatingIndividualScope();
        Facility userFacility = user.getFacility();
        Catchment catchment = user.getCatchment();
        if (ByCatchment.equals(scope)) {
            AddressLevelService addressLevelService = ApplicationContextProvider.getContext().getBean(AddressLevelService.class);
            List<Long> addressIds = addressLevelService.getAllAddressLevelIdsForCatchment(catchment);
            return repository().isEntityChangedForCatchment(addressIds, lastModifiedDateTime, typeId);
        }
        if (ByFacility.equals(scope)) {
            return repository().isEntityChangedForFacility(userFacility.getId(), lastModifiedDateTime, typeId);
        }
        return false;
    }

    OperatingIndividualScopeAwareRepository<T> repository();

    boolean isScopeEntityChanged(DateTime lastModifiedDateTime, String typeUUID);
}
