package org.avni.dao.application;

import org.avni.application.FormElementGroup;
import org.avni.dao.FindByLastModifiedDateTime;
import org.avni.dao.ReferenceDataRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "formElementGroup", path = "formElementGroup")
public interface FormElementGroupRepository extends ReferenceDataRepository<FormElementGroup>, FindByLastModifiedDateTime<FormElementGroup> {
    @Query("select f.name from FormElementGroup f where f.isVoided = false")
    List<String> getAllNames();
}
