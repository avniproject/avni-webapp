package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.CHSEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean
public interface OperatingIndividualScopeAwareRepository<T extends CHSEntity> extends JpaSpecificationExecutor<T> {
    Page<T> findByCatchmentIndividualOperatingScope(long catchmentId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);
    Page<T> findByFacilityIndividualOperatingScope(long facilityId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    default Specification<T> getFilterSpecForCatchment(Long catchmentId) {return (r,q,cb)-> cb.and();}
    default Specification<T> getFilterSpecForFacility(Long facilityId) {return (r,q,cb)-> cb.and();}
}
