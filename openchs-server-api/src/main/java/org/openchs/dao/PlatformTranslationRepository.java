package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.application.Platform;
import org.openchs.domain.Locale;
import org.openchs.domain.PlatformTranslation;
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
@RepositoryRestResource(collectionResourceRel = "platformTranslation", path = "platformTranslation")
@PreAuthorize("hasAnyAuthority('user','admin','organisation_admin')")
public interface PlatformTranslationRepository extends PagingAndSortingRepository<PlatformTranslation, Long> {

    @PreAuthorize("hasAnyAuthority('admin')")
    <S extends PlatformTranslation> S save(S entity);

    PlatformTranslation findByPlatformAndLanguage(Platform platform, Locale language);

    PlatformTranslation findByLanguage(Locale language);

    @RestResource(path = "lastModified", rel = "lastModified")
    Page<PlatformTranslation> findByLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @Param("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable);

}
