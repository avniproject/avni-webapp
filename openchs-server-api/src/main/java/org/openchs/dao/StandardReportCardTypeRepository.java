package org.openchs.dao;

import org.openchs.domain.StandardReportCardType;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "standardReportCardType", path = "standardReportCardType")
@PreAuthorize("hasAnyAuthority('user','admin','organisation_admin')")
public interface StandardReportCardTypeRepository extends PagingAndSortingRepository<StandardReportCardType, Long> {
    StandardReportCardType findByUuid(String uuid);
}
