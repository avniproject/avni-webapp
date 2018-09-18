package org.openchs.dao.individualRelationship;

import org.openchs.dao.FindByLastModifiedDateTime;
import org.openchs.dao.ReferenceDataRepository;
import org.openchs.domain.individualRelationship.IndividualRelation;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "individualRelation", path = "individualRelation")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface IndividualRelationRepository extends PagingAndSortingRepository<IndividualRelation, Long>, ReferenceDataRepository<IndividualRelation>, FindByLastModifiedDateTime<IndividualRelation> {
}