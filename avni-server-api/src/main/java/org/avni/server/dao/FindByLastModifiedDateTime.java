package org.avni.server.dao;

import org.avni.server.domain.CHSEntity;
import org.joda.time.DateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;

public interface FindByLastModifiedDateTime<T> {
    @RestResource(path = "lastModified", rel = "lastModified")
    Page<T> findByLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date lastModifiedDateTime,
            @Param("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date now,
            Pageable pageable);

    default Page<T> findByLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @Param("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return findByLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(CHSEntity.toDate(lastModifiedDateTime), CHSEntity.toDate(now), pageable);
    }

    boolean existsByLastModifiedDateTimeGreaterThan(@Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date lastModifiedDateTime);

    default boolean existsByLastModifiedDateTimeGreaterThan(DateTime lastModifiedDateTime) {
        return existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime == null ? null : lastModifiedDateTime.toDate());
    }
}
