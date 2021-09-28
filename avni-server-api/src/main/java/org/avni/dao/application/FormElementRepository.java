package org.avni.dao.application;

import org.avni.application.FormElement;
import org.avni.application.FormElementGroup;
import org.avni.dao.FindByLastModifiedDateTime;
import org.avni.dao.ReferenceDataRepository;
import org.avni.domain.Concept;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "formElement", path = "formElement")
public interface FormElementRepository extends ReferenceDataRepository<FormElement>, FindByLastModifiedDateTime<FormElement> {
    FormElement findFirstByConcept(Concept concept);

    @Query("select f.name from FormElement f where f.isVoided = false")
    List<String> getAllNames();

    List<FormElement> findAllByConceptUuidAndIsVoidedFalse(String conceptUUID);

    List<FormElement> findAllByFormElementGroupIdAndConceptDataType(long formGroupId, String dataType);
}
