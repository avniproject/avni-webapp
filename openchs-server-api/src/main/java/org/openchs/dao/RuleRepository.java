package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.Organisation;
import org.openchs.domain.Rule;
import org.openchs.domain.RuleDependency;
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
@RepositoryRestResource(collectionResourceRel = "rule", path = "rule")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface RuleRepository extends PagingAndSortingRepository<Rule, Long>, ReferenceDataRepository<Rule> {
    @RestResource(path = "lastModified", rel = "lastModified")
    Page<Rule> findByAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @Param("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable);

    List<Rule> findByOrganisationId(Long id);
}
