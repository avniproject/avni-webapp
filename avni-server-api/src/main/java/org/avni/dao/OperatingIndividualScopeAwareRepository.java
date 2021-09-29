package org.avni.dao;

import org.joda.time.DateTime;
import org.avni.domain.CHSEntity;
import org.avni.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.NoRepositoryBean;

import java.util.List;

@NoRepositoryBean
public interface OperatingIndividualScopeAwareRepository<T extends CHSEntity> extends JpaSpecificationExecutor<T> {
    Page<T> findByCatchmentIndividualOperatingScopeAndFilterByType(long catchmentId, DateTime lastModifiedDateTime, DateTime now, Long filter, Pageable pageable);
    Page<T> findByFacilityIndividualOperatingScopeAndFilterByType(long facilityId, DateTime lastModifiedDateTime, DateTime now, Long filter, Pageable pageable);
    boolean isEntityChangedForCatchment(long catchmentId, DateTime lastModifiedDateTime, Long typeId);
    boolean isEntityChangedForFacility(long facilityId, DateTime lastModifiedDateTime, Long typeId);
}
