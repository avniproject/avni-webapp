package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.Catchment;
import org.openchs.domain.Facility;
import org.openchs.domain.IdentifierSource;
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
            "where (catchment is null or (:catchment is not null and catchment = :catchment)) and " +
            "(facility is null or (:facility is not null and facility = :facility)) " +
            "and (isource.audit.lastModifiedDateTime between :lastModifiedDateTime and :now) " +
            "order by isource.audit.lastModifiedDateTime asc")
    Page<IdentifierSource> getAllAuthorisedIdentifierSources(
            @Param("catchment") Catchment catchment,
            @Param("facility") Facility facility,
            @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @Param("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable);

    @Query("select isource from IdentifierSource isource " +
            "where isource.isVoided=false and (catchment is null or (:catchment is not null and catchment = :catchment)) and " +
            "(facility is null or (:facility is not null and facility = :facility)) ")
    List<IdentifierSource> getAllAuthorisedIdentifierSources(@Param("catchment") Catchment catchment,
                                                             @Param("facility") Facility facility);
}