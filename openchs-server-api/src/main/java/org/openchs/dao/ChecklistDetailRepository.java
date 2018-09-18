package org.openchs.dao;

import org.openchs.domain.ChecklistDetail;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "checklistDetail", path = "checklistDetail")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface ChecklistDetailRepository extends PagingAndSortingRepository<ChecklistDetail, Long>, ReferenceDataRepository<ChecklistDetail>, FindByLastModifiedDateTime<ChecklistDetail> {
}
