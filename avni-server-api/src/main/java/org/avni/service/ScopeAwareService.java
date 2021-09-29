package org.avni.service;

import org.joda.time.DateTime;
import org.avni.dao.OperatingIndividualScopeAwareRepository;
import org.avni.domain.*;

import static org.avni.domain.OperatingIndividualScope.ByCatchment;
import static org.avni.domain.OperatingIndividualScope.ByFacility;

public interface ScopeAwareService<T extends CHSEntity> {

    default boolean isChanged(User user, DateTime lastModifiedDateTime, Long typeId) {
        OperatingIndividualScope scope = user.getOperatingIndividualScope();
        Facility userFacility = user.getFacility();
        Catchment catchment = user.getCatchment();
        if (ByCatchment.equals(scope)) {
            return repository().isEntityChangedForCatchment(catchment.getId(), lastModifiedDateTime, typeId);
        }
        if (ByFacility.equals(scope)) {
            return repository().isEntityChangedForFacility(userFacility.getId(), lastModifiedDateTime, typeId);
        }
        return false;
    }

    OperatingIndividualScopeAwareRepository<T> repository();

    boolean isScopeEntityChanged(DateTime lastModifiedDateTime, String typeUUID);
}
