package org.openchs.dao.application;

import org.openchs.application.FormMapping;
import org.openchs.application.FormType;
import org.openchs.dao.CHSRepository;
import org.openchs.dao.FindByLastModifiedDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "formMapping", path = "formMapping")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface FormMappingRepository extends PagingAndSortingRepository<FormMapping, Long>, CHSRepository<FormMapping>, FindByLastModifiedDateTime<FormMapping> {
    List<FormMapping> findByFormUuid(String uuid);

    FormMapping findByFormUuidAndObservationsTypeEntityId(String uuid, Long observationsTypeEntityId);

    Page<FormMapping> findByEntityId(Long entityId, Pageable pageable);

    List<FormMapping> findByEntityIdAndOrganisationIdIsNotNull(Long entityId);

    List<FormMapping> findAllByEntityIdIsNotNull();

    List<FormMapping> findAllByEntityIdIsNullAndObservationsTypeEntityIdIsNotNull();

    List<FormMapping> findAllByEntityIdIsNullAndObservationsTypeEntityIdIsNull();

    FormMapping findByEntityIdAndObservationsTypeEntityIdAndFormFormType(Long entityId, Long observationsTypeEntityId, FormType formType);
}