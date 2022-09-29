package org.avni.server.dao;

import org.avni.server.domain.RuleDependency;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Repository;

import java.util.Date;

@Repository
@RepositoryRestResource(collectionResourceRel = "ruleDependency", path = "ruleDependency")
public interface RuleDependencyRepository extends ImplReferenceDataRepository<RuleDependency> {
    RuleDependency findByOrganisationId(Long organisationId);

    @RestResource(path = "lastModified", rel = "lastModified")
    Page<RuleDependency> findByLastModifiedDateTimeIsBetween(
            @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date lastModifiedDateTime,
            @Param("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date now, Pageable pageable);

    default RuleDependency findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in RuleDependency");
    }

    default RuleDependency findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in RuleDependency");
    }

    boolean existsByLastModifiedDateTimeGreaterThan(Date lastModifiedDateTime);

}
