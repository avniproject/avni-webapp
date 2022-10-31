package org.avni.server.dao;

import org.joda.time.DateTime;
import org.avni.server.domain.StandardReportCardType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "standardReportCardType", path = "standardReportCardType")
@PreAuthorize("hasAnyAuthority('user','admin')")
public interface StandardReportCardTypeRepository extends PagingAndSortingRepository<StandardReportCardType, Long> {
    StandardReportCardType findByUuid(String uuid);

    List<StandardReportCardType> findAllByIsVoidedFalse();

    @RestResource(path = "lastModified", rel = "lastModified")
    Page<StandardReportCardType> findByLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @Param("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable);

    boolean existsByLastModifiedDateTimeGreaterThan(DateTime lastModifiedDateTime);
}
