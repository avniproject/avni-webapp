package org.avni.server.dao.application;

import org.avni.server.application.FormElementGroup;
import org.avni.server.dao.FindByLastModifiedDateTime;
import org.avni.server.dao.ReferenceDataRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "formElementGroup", path = "formElementGroup")
public interface FormElementGroupRepository extends ReferenceDataRepository<FormElementGroup>, FindByLastModifiedDateTime<FormElementGroup> {
    @Query("select f.name from FormElementGroup f where f.isVoided = false")
    List<String> getAllNames();
}
