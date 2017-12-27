package org.openchs.dao.application;

import org.joda.time.DateTime;
import org.openchs.application.FormMapping;
import org.openchs.application.FormType;
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
public interface FormMappingRepository extends PagingAndSortingRepository<FormMapping, Long> {
    @RestResource(path = "lastModified", rel = "lastModified")
    Page<FormMapping> findByLastModifiedDateTimeGreaterThanOrderByLastModifiedDateTimeAscIdAsc(@Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime, Pageable pageable);
    List<FormMapping> findByFormUuid(String uuid);
    FormMapping findByFormUuidAndObservationsTypeEntityId(String uuid, Long observationsTypeEntityId);
    Page<FormMapping> findByEntityId(Long entityId, Pageable pageable);
    FormMapping findByEntityIdAndObservationsTypeEntityIdAndFormFormType(Long entityId, Long observationsTypeEntityId, FormType formType);
}