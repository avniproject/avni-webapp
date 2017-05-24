package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.AddressLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;

@Transactional
@Repository
@RepositoryRestResource(collectionResourceRel = "addressLevel", path = "addressLevel")
public interface AddressLevelRepository extends PagingAndSortingRepository<AddressLevel, Long>, CHSRepository<AddressLevel> {
    @RestResource(path = "byCatchmentAndLastModified", rel = "byCatchmentAndLastModified")
    Page<AddressLevel> findByCatchmentsIdAndLastModifiedDateTimeGreaterThanOrderByLastModifiedDateTimeAscIdAsc(@Param("catchmentId") long catchmentId, @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime, Pageable pageable);
}