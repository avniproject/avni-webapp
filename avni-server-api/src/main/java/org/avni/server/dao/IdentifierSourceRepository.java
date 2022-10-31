package org.avni.server.dao;
import java.util.Date;
import org.avni.server.domain.Catchment;
import org.avni.server.domain.IdentifierSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "identifierSource", path = "identifierSource", exported = false)
public interface IdentifierSourceRepository extends ReferenceDataRepository<IdentifierSource> {

    @RestResource(path = "findAllById", rel = "findAllById")
    Page<IdentifierSource> findByIdIn(@Param("ids") Long[] ids, Pageable pageable);

    @Query("select isource from IdentifierSource isource " +
            "where (catchment is null or (:catchment is not null and catchment = :catchment)) " +
            "and (isource.lastModifiedDateTime between :lastModifiedDateTime and :now) " +
            "order by isource.lastModifiedDateTime asc")
    Page<IdentifierSource> getAllAuthorisedIdentifierSources(
            @Param("catchment") Catchment catchment,
            @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date lastModifiedDateTime,
            @Param("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date now,
            Pageable pageable);

    @Query("select isource from IdentifierSource isource " +
            "where isource.isVoided=false and (catchment is null or (:catchment is not null and catchment = :catchment)) ")
    List<IdentifierSource> getAllAuthorisedIdentifierSources(@Param("catchment") Catchment catchment);

    boolean existsByLastModifiedDateTimeGreaterThan(Date lastModifiedDateTime);
}
