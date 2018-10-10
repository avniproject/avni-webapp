package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.CHSEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OperatingIndividualScopeAwareRepository<T extends CHSEntity> {
    Page<T> findByCatchmentIndividualOperatingScope(long catchmentId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);
    Page<T> findByFacilityIndividualOperatingScope(long facilityId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);
}
