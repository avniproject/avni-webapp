package org.openchs.dao.individualRelationship;

import org.joda.time.DateTime;
import org.openchs.dao.CHSRepository;
import org.openchs.dao.FindByLastModifiedDateTime;
import org.openchs.domain.individualRelationship.IndividualRelationship;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "individualRelationship", path = "individualRelationship", exported = false)
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface IndividualRelationshipRepository extends PagingAndSortingRepository<IndividualRelationship, Long>, CHSRepository<IndividualRelationship>, FindByLastModifiedDateTime<IndividualRelationship> {
    Page<IndividualRelationship> findByIndividualaAddressLevelVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long catchmentId,
            DateTime lastModifiedDateTime,
            DateTime now,
            Pageable pageable);

}