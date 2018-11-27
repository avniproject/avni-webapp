package org.openchs.dao.application;

import org.openchs.application.FormMapping;
import org.openchs.application.FormType;
import org.openchs.dao.FindByLastModifiedDateTime;
import org.openchs.dao.ReferenceDataRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "formMapping", path = "formMapping")
public interface FormMappingRepository extends ReferenceDataRepository<FormMapping>, FindByLastModifiedDateTime<FormMapping> {
    List<FormMapping> findByFormUuid(String uuid);

    FormMapping findByFormUuidAndObservationsTypeEntityId(String uuid, Long observationsTypeEntityId);

    Page<FormMapping> findByEntityId(Long entityId, Pageable pageable);

    List<FormMapping> findByEntityIdAndOrganisationIdIsNotNull(Long entityId);

    List<FormMapping> findAllByEntityIdIsNotNull();

    List<FormMapping> findAllByEntityIdIsNullAndObservationsTypeEntityIdIsNotNull();

    List<FormMapping> findAllByEntityIdIsNullAndObservationsTypeEntityIdIsNull();

    FormMapping findByEntityIdAndObservationsTypeEntityIdAndFormFormType(Long entityId, Long observationsTypeEntityId, FormType formType);

    default FormMapping findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in FormMapping");
    }

    default FormMapping findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in FormMapping");
    }
}