package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.IndividualReverseRelation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "individualReverseRelation", path = "individualReverseRelation")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface IndividualReverseRelationRepository extends PagingAndSortingRepository<IndividualReverseRelation, Long>, CHSRepository<IndividualReverseRelation> {
    @RestResource(path = "lastModified", rel = "lastModified")
    Page<IndividualReverseRelation> findByAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @Param("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable);
}