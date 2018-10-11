package org.openchs.dao;


import org.openchs.domain.ChecklistItemDetail;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "checklistItemDetail", path = "checklistItemDetail")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface ChecklistItemDetailRepository extends PagingAndSortingRepository<ChecklistItemDetail, Long>, CHSRepository<ChecklistItemDetail>, FindByLastModifiedDateTime<ChecklistItemDetail> {
    ChecklistItemDetail findByConceptNameIgnoreCase(String conceptName);
}