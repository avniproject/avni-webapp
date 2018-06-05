package org.openchs.dao.application;

import org.joda.time.DateTime;
import org.openchs.application.FormMapping;
import org.openchs.application.FormType;
import org.openchs.dao.CHSRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "formMapping", path = "formMapping")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface FormMappingRepository extends PagingAndSortingRepository<FormMapping, Long>, CHSRepository<FormMapping> {
    @RestResource(path = "lastModified", rel = "lastModified")
    Page<FormMapping> findByAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @Param("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable);

    List<FormMapping> findByFormUuid(String uuid);

    FormMapping findByFormUuidAndObservationsTypeEntityId(String uuid, Long observationsTypeEntityId);

    Page<FormMapping> findByEntityId(Long entityId, Pageable pageable);

    List<FormMapping> findByEntityIdAndOrganisationIdIsNotNull(Long entityId);

    List<FormMapping> findAllByEntityIdIsNotNull();
    List<FormMapping> findAllByEntityIdIsNullAndObservationsTypeEntityIdIsNotNull();
    List<FormMapping> findAllByEntityIdIsNullAndObservationsTypeEntityIdIsNull();

    FormMapping findByEntityIdAndObservationsTypeEntityIdAndFormFormType(Long entityId, Long observationsTypeEntityId, FormType formType);
}