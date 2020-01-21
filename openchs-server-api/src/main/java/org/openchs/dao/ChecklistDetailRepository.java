package org.openchs.dao;

import org.openchs.domain.ChecklistDetail;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "checklistDetail", path = "checklistDetail")
@PreAuthorize("hasAnyAuthority('user', 'organisation_admin')")
public interface ChecklistDetailRepository extends ImplReferenceDataRepository<ChecklistDetail>, FindByLastModifiedDateTime<ChecklistDetail> {

    @Query("select c.name from ChecklistDetail c where c.isVoided = false")
    List<String> getAllNames();
}
