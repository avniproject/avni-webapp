package org.openchs.dao.individualRelationship;

import org.openchs.dao.CHSRepository;
import org.openchs.dao.FindByLastModifiedDateTime;
import org.openchs.domain.individualRelationship.IndividualRelationGenderMapping;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "individualRelationGenderMapping", path = "individualRelationGenderMapping")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface IndividualRelationGenderMappingRepository extends PagingAndSortingRepository<IndividualRelationGenderMapping, Long>, CHSRepository<IndividualRelationGenderMapping>, FindByLastModifiedDateTime<IndividualRelationGenderMapping> {
}