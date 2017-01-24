package org.openchs.dao.application;

import org.joda.time.DateTime;
import org.openchs.application.FormElement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;

@Transactional
@Repository
@RepositoryRestResource(collectionResourceRel = "formElement", path = "formElement")
public interface FormElementRepository extends PagingAndSortingRepository<FormElement, Long> {
    @RestResource(path = "lastModified", rel = "lastModified")
    Page<FormElement> findByLastModifiedDateTimeGreaterThanOrderById(@Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime, Pageable pageable);
}