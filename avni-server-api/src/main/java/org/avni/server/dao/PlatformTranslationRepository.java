package org.avni.server.dao;

import org.avni.server.application.Platform;
import org.avni.server.domain.Locale;
import org.avni.server.domain.PlatformTranslation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.Date;

@Repository
@RepositoryRestResource(collectionResourceRel = "platformTranslation", path = "platformTranslation", exported = false)
@PreAuthorize("hasAnyAuthority('user','admin')")
public interface PlatformTranslationRepository extends PagingAndSortingRepository<PlatformTranslation, Long> {

    @PreAuthorize("hasAnyAuthority('admin')")
    <S extends PlatformTranslation> S save(S entity);

    PlatformTranslation findByPlatformAndLanguage(Platform platform, Locale language);

    PlatformTranslation findByLanguage(Locale language);

    Page<PlatformTranslation> findByPlatformAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            Platform platform,
            Date lastModifiedDateTime,
            Date now,
            Pageable pageable);

    boolean existsByPlatformAndLastModifiedDateTimeGreaterThan(Platform platform, Date lastModifiedDateTime);

}
