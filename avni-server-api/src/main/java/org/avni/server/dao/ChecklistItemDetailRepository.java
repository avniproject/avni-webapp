package org.avni.server.dao;


import org.avni.server.domain.ChecklistItemDetail;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "checklistItemDetail", path = "checklistItemDetail")
public interface ChecklistItemDetailRepository extends ImplReferenceDataRepository<ChecklistItemDetail>, FindByLastModifiedDateTime<ChecklistItemDetail> {
    ChecklistItemDetail findByConceptName(String conceptName);
    ChecklistItemDetail findByConceptNameIgnoreCase(String conceptName);

    default ChecklistItemDetail findByName(String name) {
        return findByConceptName(name);
    }

    default ChecklistItemDetail findByNameIgnoreCase(String name) {
        return findByConceptNameIgnoreCase(name);
    }
}
