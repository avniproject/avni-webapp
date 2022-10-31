package org.avni.server.dao;

import org.avni.server.domain.ChecklistDetail;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "checklistDetail", path = "checklistDetail")
public interface ChecklistDetailRepository extends ImplReferenceDataRepository<ChecklistDetail>, FindByLastModifiedDateTime<ChecklistDetail> {

    @Query("select c.name from ChecklistDetail c where c.isVoided = false")
    List<String> getAllNames();

}
