package org.openchs.dao.application;

import org.openchs.application.FormElement;
import org.openchs.application.FormElementGroup;
import org.openchs.dao.FindByLastModifiedDateTime;
import org.openchs.dao.ReferenceDataRepository;
import org.openchs.domain.Concept;
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
