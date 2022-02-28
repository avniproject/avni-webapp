package org.avni.dao;

import org.joda.time.DateTime;
import org.avni.domain.Facility;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "facility", path = "facility")
public interface FacilityRepository extends ReferenceDataRepository<Facility> {
    @RestResource(path = "lastModified", rel = "lastModified")
    Page<Facility> findByLastModifiedDateTimeIsBetweenAndIsVoidedFalseOrderByLastModifiedDateTimeAscIdAsc(
            @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date lastModifiedDateTime,
            @Param("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date now,
            Pageable pageable);

    @RestResource(path = "byCatchmentAndLastModified", rel = "byCatchmentAndLastModified")
    Page<Facility> findByAddressLevelCatchmentsIdAndLastModifiedDateTimeIsBetweenAndIsVoidedFalseOrderByLastModifiedDateTimeAscIdAsc(
            @Param("catchmentId") long catchmentId,
            @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date lastModifiedDateTime,
            @Param("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date now,
            Pageable pageable);

    @RestResource(path = "findAllById", rel = "findAllById")
    List<Facility> findByIdIn(@Param("ids") Long[] ids);
}